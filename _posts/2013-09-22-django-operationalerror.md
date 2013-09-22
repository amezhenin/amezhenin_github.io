---
layout: post
title: "Django: OperationalError no connection to the server"
description: ""
category: django
tags: [django, deploy, gunicorn]
---
{% include JB/setup %}

<link rel="stylesheet" href="/pygments.css"/>

Я развернул свой проект на Django в окружении [Nginx](http://nginx.org/ru/)+[Gunicorn](http://gunicorn.org/)+[PostgreSQL](http://www.postgresql.org/), после чего у меня появились проблемы со всеми запросами, которые обращаются к БД. Запросы падали с ошибкой `OperationalError: no connection to the server`, хотя сервер БД находился на той же физической машине, и проблем с доступом не было. Самым странным было то, что сбои происходили не всегда, а с некоторой вероятностью.

Я долго пытался нагуглить решение этой проблемы, но нашёл только [это](http://lists.gunicorn.org/user/0029.html). Автор рекомендует добавить следующие строки в конфиг для **gunicorn**:

{% highlight python %}

from django.db import close_connection
def pre_fork(server, worker):
    close_connection()

{% endhighlight %}

Ссылка на [официальную документацию](http://docs.gunicorn.org/en/latest/configure.html#pre-fork).

Вот как выглядит мой **gunicorn.conf.py**:

    bind = "127.0.0.1:8080"
    worker_class = "sync"
    workers = 10
    max_requests = 5000
    loglevel = "info"
    proc_name = "gunicorn"
    accesslog = "/var/log/django/gunicorn_access.log"
    errorlog = "/var/log/django/gunicorn_error.log"

    from django.db import close_connection
    def pre_fork(server, worker):
        close_connection()
    