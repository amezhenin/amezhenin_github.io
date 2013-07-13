---
layout: post
title: "Mongo $maxScan: делаем поиск без индекса"
description: ""
category: mongodb
tags: [mongodb, snippets]
published: false
---
{% include JB/setup %}

В MongoDB существует параметр запроса [$maxScan](http://docs.mongodb.org/manual/reference/operator/maxScan/), который имеет следующий синтаксис:

    db.collection.find( { <query> } )._addSpecial( "$maxScan" , <number> )
    db.collection.find( { $query: { <query> }, $maxScan: <number> } )
    
количество просканированных(`nscanned`) документов не может превысить, заданную в запросе, величину.

У меня есть небольшой опыт применения этого параметра на практике.