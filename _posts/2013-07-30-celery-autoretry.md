---
layout: post
title: "Autoretry для Сelery"
description: ""
category: celery
tags: [celery, python]
published: false
---
{% include JB/setup %}

В [Celery](http://www.celeryproject.org/) есть возможность перезапускать задачи, в случае неудачного выполнения. Для этого существует ф-ция [retry](http://docs.celeryproject.org/en/latest/reference/celery.app.task.html#celery.app.task.Task.retry), работу которой можно понять из следующего примера:

    @task_autoretry(max_retries=5, default_retry_delay=1)
    def div(a, b):
        try:
            return a / b
        except ZeroDivisionError, exc:
            raise div.retry(exc=exc)

Если мы попытаемся разделить на ноль, задача **div** будет повтороно запущена спустя секунду. Каждый такой вызов будет увеличивать значение счетчика повторных запусков, пока тот не достигнет пяти. Только после этого выполнение задачи будет прекращено полностью, а в качестве результата её работы вернётся исключение *ZeroDivisionError*.

Из этого примера видно, что все исключения нужно отслеживать самостоятельно, потому что Celery не умеет делать это в автоматеческом режиме. На githab-е даже есть [feature-request](https://github.com/celery/celery/issues/1175) на эту тему.

Я решил пойти простым путем и написал неболшой декоратор, который автоматически делает перезапуск(*retry*), если декорируемая функция вернула исключение:

    def task_autoretry(*args_task, **kwargs_task):
        def real_decorator(func):
            @task(*args_task, **kwargs_task)
            def wrapper(*args, **kwargs):
                try:
                    func(*args, **kwargs)
                except kwargs_task.get('autoretry_on', Exception), exc:
                    raise wrapper.retry(exc=exc)
            return wrapper
        return real_decorator


Используя этот декоратор, мы сможем преобразовать нашу задачу деления дву чисел у следующему виду:

    @task_autoretry(max_retries=5, default_retry_delay=1, autoretry_on=ZeroDivisionError)
    def div(a, b):
        return a / b