---
layout: post
title: "Autoretry для Сelery"
description: ""
category: celery
tags: [celery, python]
---



В [Celery](http://www.celeryproject.org/) есть возможность перезапускать задачи, в случае неудачного выполнения. Для этого существует функция [retry](http://docs.celeryproject.org/en/latest/reference/celery.app.task.html#celery.app.task.Task.retry), работу которой можно понять из следующего примера:

{% highlight python %}
@task(max_retries=5, default_retry_delay=1)
def div(a, b):
    try:
        return a / b
    except ZeroDivisionError, exc:
        raise div.retry(exc=exc)
{% endhighlight %}

Если мы попытаемся разделить на ноль, задача **div** будет повторно запущена спустя секунду. Каждый такой вызов будет увеличивать значение счетчика повторных запусков, пока тот не достигнет пяти. Только после этого выполнение задачи будет прекращено полностью, а в качестве результата её работы вернётся исключение *ZeroDivisionError*.

Из этого примера видно, что все исключения нужно отслеживать самостоятельно, потому что Celery не умеет делать это в автоматическом режиме. На githab-е даже есть [feature-request на эту тему](https://github.com/celery/celery/issues/1175).

Я решил пойти простым путем и написал небольшой декоратор, который автоматически делает перезапуск(*retry*), если декорируемая функция вернула исключение:

{% highlight python %}
def task_autoretry(*args_task, **kwargs_task):
    """
    Этот декоратор подменяет поведение декоратора Celery.task добавляя
    автоматический перезапуск задач в случае ошибок. По умолчанию отслеживаются
    все исключения(Exception), но кортеж исключений можно указать с помощью
    параметра autoretry_on 
    """
    def real_decorator(func):
        @task(*args_task, **kwargs_task)
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                func(*args, **kwargs)
            except kwargs_task.get('autoretry_on', Exception), exc:
                wrapper.retry(exc=exc)
        return wrapper
    return real_decorator
{% endhighlight %}

Используя этот декоратор, мы сможем преобразовать нашу задачу деления двух чисел к следующему виду:

{% highlight python %}
@task_autoretry(max_retries=5, default_retry_delay=1, autoretry_on=ZeroDivisionError)
def div(a, b):
    return a / b
{% endhighlight %}

**UPD.** Обязательно используйте [functools.wraps](http://docs.python.org/2/library/functools.html#functools.wraps), иначе функция `wrapper` подменит имя оригинальной функции `func` на своё собственное. Декоратор `Celery.task` использует имена функций в качестве [имени для задачи](http://docs.celeryproject.org/en/latest/userguide/tasks.html#names).