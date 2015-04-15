---
layout: post
title: "Управление сервисами на продакшен сервере"
description: ""
category: devops
tags: [fabric, devops]
---


<link rel="stylesheet" href="/pygments.css"/>

В одном из [прошлых постов]({% post_url 2013-08-22-fabric-log-recipe %}), я начал рассказывал о том, как **Fabric** позволяет автоматизировать различные операции на серверах. Сейчас я бы хотел поделиться своим небольшим рецептом по управлению сервисами на продакшен серверах.

С своем примере я буду использовать сервер, который состоит из следующих компонент:

* Nginx
* PostgreSQL
* Redis
* Supervisor+Gunicorn

Связку [Supervisor+Gunicorn](http://blog.djangofan.ru/2012/04/gunicorn-nginx-django-ubuntu.html) я использую для запуска application-сервера. Я предполагаю, что сервера уже установлены и настроены. Рецепты для установки и настройки я выложу как-нибудь позднее.

# So where is code?

Итак, для начала нам нужен список самих сервисов:

{% highlight python %}

    SERVICES = {
                'nginx': '/etc/init.d/nginx %s',
                'postgresql': '/etc/init.d/postgresql %s',
                'redis': '/etc/init.d/redis-server %s',
                'supervisor': '/etc/init.d/supervisor %s',
                'gunicorn': 'supervisorctl %s gunicorn',
                # other services
               }

{% endhighlight %}

В данном, случае ключами в словаре являются названия сервисов, а значениям - шаблоны команд, в которые мы будет подставлять нужные действия.

Со временем я понял, что обращаться к сервисам по названию не всегда удобно, поэтому пронумеровал все сервисы цифрами:

{% highlight python %}

    SERVICES_LIST = ['nginx',
                     'mongo',
                     'postgresql',
                     'redis']
    
    def _clean(service):
        try:
            # -1 --> we use one based indexes in console
            service = SERVICES_LIST[int(service) - 1]
        except (ValueError, IndexError):
            pass
    
        if service not in SERVICES:
            print "Bad argument. Should be one of " + str(SERVICES.keys())
            print "You can use int for service number: "
            for i in enumerate(SERVICES_LIST):
                print "%s) %s" % (i[0] + 1, i[1])
            exit()
        return service
    
{% endhighlight %}

`_clean`, выполняет две функции:<br>
&bull; преобразует числовые значения сервисов в строковые <br>
&bull; проверяет наличие такого сервиса в общем списке и выводи сообщение с подсказкой в случае проблем.<br>

Теперь все готово для написать самих функции управления сервисами:

{% highlight python %}
@task
def stop(service):
    service = _clean(service)
    sudo(SERVICES[service] % ("stop",)) 
{% endhighlight %}
{% highlight python %}
@task
def start(service):
    service = _clean(service)
    sudo(SERVICES[service] % ("start",))
{% endhighlight %}
{% highlight python %}
@task
def restart(service):
    service = _clean(service)
    sudo(SERVICES[service] % ("restart",))
{% endhighlight %}
{% highlight python %}
@task
def status(service):
    service = _clean(service)
    sudo(SERVICES[service] % ("status",))    
{% endhighlight %}

Теперь можно опробовать их в деле, используя следующие консольные команды:

    fab -H <hostname> status:1
    fab -H <hostname> status:nginx
    fab -H <hostname> status:asdf 

Последняя команда отобразит небольшую подсказку со списком доступных сервисов. Данный *рецепт* для **fabric** можно скачать [здесь](https://github.com/amezhenin/fabric_recipes/blob/master/fab_services.py).