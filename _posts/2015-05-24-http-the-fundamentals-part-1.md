---
layout: post
title: "HTTP: The Fundamentals. Part 1"
description: ""
category: web
tags: [popular, web, http]
published: true
---
{% include JB/setup %}

*This is attempt to resurrect a great post about HTTP protocol originally posted in [pypix.com](http://pypix.com) blog. That was a great resource, but it's been down for awhile. Hope you'll enjoy it.*

<p class="fig">
<img src="/images/pypix/http/http.jpg" style="width: 100%;" align='center'/></p>

# HTTP: The Fundamentals. Part 1

HTTP stands for Hypertext Transfer Protocol. It’s a stateless, application-layer protocol for communicating between distributed systems, and is the foundation of the modern web. As a web developer, we all must have a strong understanding of this protocol.

Let’s review this powerful protocol through the lens of a web developer. We’ll tackle the topic in two sections. In this first section, we’ll cover the basics and outline the various request and response headers. In the follow-up section, we’ll review specific pieces of HTTP – namely caching, connection handling and authentication.

Although I’ll mention some details related to headers, it’s best to instead consult the RFC ([RFC 2616](http://www.w3.org/Protocols/rfc2616/rfc2616)) for in-depth coverage. I will be pointing to specific parts of the RFC throughout the article.

## HTTP Basics

HTTP allows for communication between a variety of hosts and clients, and supports a mixture of network configurations. To make this possible, it assumes very little about a particular system, and does not keep state between different message exchanges.

This makes HTTP a **stateless** protocol. The communication usually takes place over TCP/IP, but any reliable transport can be used. The default port for TCP/IP is **80**, but other ports can also be used.

Communication between a host and a client occurs, via a **request/response pair**. The client initiates an HTTP request message, which is serviced through a HTTP response message in return. We will look at this fundamental message-pair in the next section.

The current version of the protocol is **HTTP/1.1**, which adds a few extra features to the previous 1.0 version. The most important of these, in my opinion, includes *persistent connections, chunked transfer-coding* and *fine-grained caching headers*. We’ll briefly touch upon these features in this article; in-depth coverage will be provided in part two.

## URLs

At the heart of web communications is the request message, which are sent via Uniform Resource Locators (URLs). I’m sure you are already familiar with URLs, but for completeness sake, I’ll include it here. URLs have a simple structure that consists of the following components:

<p class="fig">
<img src="/images/pypix/http/http1-url-structure.png" style="width: 100%;" align='center'/></p>

The protocol is typically `http`, but it can also be `https` for secure communications. The default port is `80`, but one can be set explicitly, as illustrated in the above image. The resource path is the *local path* to the resource on the server.

## Verbs

URLs reveal the identity of the particular host with which we want to communicate, but the action that should be performed on the host is specified via HTTP verbs. Of course, there are several actions that a client would like the host to perform. HTTP has formalized on a few that capture the essentials that are universally applicable for all kinds of applications.

These request verbs are:

* **GET**: *fetch* an existing resource. The URL contains all the necessary information the server needs to locate and return the resource.

* **POST**: *create* a new resource. POST requests usually carry a payload that specifies the data for the new resource.

* **PUT**: *update* an existing resource. The payload may contain the updated data for the resource.

* **DELETE**: *delete* an existing resource.

The above four verbs are the most popular, and most tools and frameworks explicitly expose these request verbs. `PUT` and `DELETE` are sometimes considered specialized versions of the `POST` verb, and they may be packaged as `POST` requests with the payload containing the exact action: *create, update* or *delete*.

There are some lesser used verbs that HTTP also supports:

* **HEAD**: this is similar to GET, but without the message body. It’s used to retrieve the server headers for a particular resource, generally to check if the resource has changed, via timestamps.

* **TRACE**: used to retrieve the hops that a request takes to round trip from the server. Each intermediate proxy or gateway would inject its IP or DNS name into the `Via` header field. This can be used for diagnostic purposes.

* **OPTIONS**: used to retrieve the server capabilities. On the client-side, it can be used to modify the request based on what the server can support.

## Status Codes

With URLs and verbs, the client can initiate requests to the server. In return, the server responds with status codes and message payloads. The status code is important and tells the client how to interpret the server response. The HTTP spec defines certain number ranges for specific types of responses:

### 1xx: Informational Messages

This class of codes was introduced in HTTP/1.1 and is purely provisional. The server can send a `Expect: 100-continue` message, telling the client to continue sending the remainder of the request, or ignore if it has already sent it. HTTP/1.0 clients are supposed to ignore this header.

### 2xx: Successful

This tells the client that the request was successfully processed. The most common code is **200 OK**. For a `GET` request, the server sends the resource in the message body. There are other less frequently used codes:

* **202** Accepted: the request was accepted but may not include the resource in the response. This is useful for async processing on the server side. The server may choose to send information for monitoring.

* **204** No Content: there is no message body in the response.

* **205** Reset Content: indicates to the client to reset its document view.

* **206** Partial Content: indicates that the response only contains partial content. Additional headers indicate the exact range and content expiration information.

### 3xx: Redirection

This requires the client to take additional action. The most common use-case is to jump to a different URL in order to fetch the resource.

* **301** Moved Permanently: the resource is now located at a new URL.

* **303** See Other: the resource is temporarily located at a new URL. The `Location` response header contains the temporary URL.

* **304** Not Modified: the server has determined that the resource has not changed and the client should use its cached copy. This relies on the fact that the client is sending `ETag` (Entity Tag) information that is a hash of the content. The server compares this with its own computed `ETag` to check for modifications.

### 4xx: Client Error

These codes are used when the server thinks that the client is at fault, either by requesting an invalid resource or making a bad request. The most popular code in this class is **404 Not Found**, which I think everyone will identify with. 404 indicates that the resource is invalid and does not exist on the server. The other codes in this class include:

* **400** Bad Request: the request was malformed.
* **401** Unauthorized: request requires authentication. The client can repeat the request with the `Authorization` header. If the client already included the `Authorization` header, then the credentials were wrong.
* **403** Forbidden: server has denied access to the resource.
* **405** Method Not Allowed: invalid HTTP verb used in the request line, or the server does not support that verb.
* **409** Conflict: the server could not complete the request because the client is trying to modify a resource that is newer than the client’s timestamp. Conflicts arise mostly for PUT requests during collaborative edits on a resource.

### 5xx: Server Error

This class of codes are used to indicate a server failure while processing the request. The most commonly used error code is **500 Internal Server Error**. The others in this class are:

* **501** Not Implemented: the server does not yet support the requested functionality.
* **503** Service Unavailable: this could happen if an internal system on the server has failed or the server is overloaded. Typically, the server won’t even respond and the request will timeout.


## Request and Response Message Formats

So far, we’ve seen that URLs, verbs and status codes make up the fundamental pieces of an HTTP request/response pair.

<p class="fig">
<img src="/images/pypix/http/http1-req-res-details.png" style="width: 100%;" align='center'/></p>

Let’s now look at the content of these messages. The HTTP specification states that a request or response message has the following generic structure:

    message = <start-line>
              *(<message-header>)
              CRLF
              [<message-body>]
     
    <start-line> = Request-Line | Status-Line 
    <message-header> = Field-Name ':' Field-Value
    
It’s mandatory to place a new line between the message headers and body. The message can contain one or more headers, of which are broadly classified into:

* [general headers](http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.5): that are applicable for both request and response messages.
* [request specific headers](http://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html#sec5.3).
* [response specific headers](http://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html#sec6.2).
* [entity headers](http://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7.1).

The message body may contain the complete entity data, or it may be piecemeal if the chunked encoding (`Transfer-Encoding: chunked`) is used. All HTTP/1.1 clients are required to accept the `Transfer-Encoding` header.

### General Headers

There are a few headers (general headers) that are shared by both request and response messages:

    general-header = Cache-Control            
                   | Connection        
                   | Date              
                   | Pragma            
                   | Trailer           
                   | Transfer-Encoding 
                   | Upgrade           
                   | Via               
                   | Warning
    
We have already seen some of these headers, specifically `Via` and `Transfer-Encoding`. We will cover `Cache-Control` and `Connection` in second section.

* `Via` header is used in a TRACE message and updated by all intermittent proxies and gateways

* `Pragma` is considered a custom header and may be used to include implementation-specific headers. The most commonly used pragma-directive is Pragma: no-cache, which really is Cache-
Control: no-cacheunder HTTP/1.1. This will be covered in Part 2 of the article.

* The `Date` header field is used to timestamp the request/response message

* `Upgrade` is used to switch protocols and allow a smooth transition to a newer protocol.

* `Transfer-Encoding` is generally used to break the response into smaller parts with the Transfer-Encoding: chunked value. This is a new header in HTTP/1.1 and allows for streaming of response to the client instead of one big payload.

### Entity headers

Request and Response messages may also include entity headers to provide meta-information about the the content (aka Message Body or Entity). These headers include:

    entity-header  = Allow                    
                   | Content-Encoding  
                   | Content-Language  
                   | Content-Length    
                   | Content-Location  
                   | Content-MD5       
                   | Content-Range     
                   | Content-Type      
                   | Expires           
                   | Last-Modified
                   
All of the `Content-` prefixed headers provide information about the structure, encoding and size of the message body. Some of these headers need to be present if the entity is part of the message.

The `Expires` header indicates a timestamp of when the entity expires. Interestingly, a *“never expires”* entity is sent with a timestamp of one year into the future. The `Last-Modified` header indicates the last modification timestamp for the entity.

## Request Format

The request message has the same generic structure as above, except for the request line which looks like:

    Request-Line = Method SP URI SP HTTP-Version CRLF
    Method = "OPTIONS"
           | "HEAD"  
           | "GET"  
           | "POST"  
           | "PUT"  
           | "DELETE"  
           | "TRACE"
    
`SP` is the space separator between the tokens. `HTTP-Version` is specified as *“HTTP/1.1”* and then followed by a new line. Thus, a typical request message might look like:

    GET /articles/http-basics HTTP/1.1
    Host: www.articles.com
    Connection: keep-alive
    Cache-Control: no-cache
    Pragma: no-cache
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
    
Note the request line followed by many request headers. The **Host** header is mandatory for HTTP/1.1 clients. **GET** requests do not have a message body, but **POST** requests can contain the post data in the body.

The request headers act as modifiers of the request message. The complete list of known request headers is not too long, and is provided below. Unknown headers are treated as entity-header fields.

    request-header = Accept                   
                   | Accept-Charset    
                   | Accept-Encoding   
                   | Accept-Language   
                   | Authorization     
                   | Expect            
                   | From              
                   | Host              
                   | If-Match          
                   | If-Modified-Since 
                   | If-None-Match     
                   | If-Range          
                   | If-Unmodified-Since
                   | Max-Forwards       
                   | Proxy-Authorization
                   | Range              
                   | Referer            
                   | TE                 
                   | User-Agent

The `Accept` prefixed headers indicate the acceptable media-types, languages and character sets on the client. `From`, `Host`, `Referer` and `User-Agent` identify details about the client that initiated the request. The `If-` prefixed headers are used to make a request more conditional, and the server returns the resource only if the condition matches. Otherwise, it returns a `304 Not Modified`. The condition can be based on a timestamp or an ETag (a hash of the entity).

## Response Format

The response format is similar to the request message, except for the status line and headers. The status line has the following structure:

    Status-Line = HTTP-Version SP Status-Code SP Reason-Phrase CRLF

* HTTP-Version is sent as `HTTP/1.1`
* The Status-Code is one of the many statuses discussed earlier.
* The Reason-Phrase is a human-readable version of the status code.

A typical status line for a successful response might look like so:

    HTTP/1.1 200 OK
    
The response headers are also fairly limited, and the full set is given below:

    response-header = Accept-Ranges
                    | Age
                    | ETag              
                    | Location          
                    | Proxy-Authenticate
                    | Retry-After       
                    | Server            
                    | Vary              
                    | WWW-Authenticate
    
* `Age` is the time in seconds since the message was generated on the server.
* `ETag` is the MD5 hash of the entity and used to check for modifications.
* `Location` is used when sending a redirection and contains the new URL.
* `Server` identifies the server generating the message.

It’s been a lot of theory upto this point, so I won’t blame you for drowsy eyes. In the next sections, we will get more practical and take a survey of the tools, frameworks and libraries.




