---
layout: post
title: "Визуализация моделей Django"
description: ""
category: django
tags: [django, python]
---



Я уже давно использую `django-extensions + graphviz` для визуализации Django моделей. Этим рецептом я и хотел сегодня поделиться, потому что в [интернетах](http://lurkmore.to/%D0%98%D0%BD%D1%82%D0%B5%D1%80%D0%BD%D0%B5%D1%82%D1%8B) этот набор команд мне всегда приходится собирать по частям.

Настройка довольно проста, для начала установим `libgraphviz-dev` и `graphviz` из репозитория. У меня Ubuntu, поэтому я делаем так:

    sudo apt-get install libgraphviz-dev graphviz

Теперь идем в виртуальное окружение(если вы таковым пользуетесь, а если не пользуетесь, то вам [давно пора начать](http://adw0rd.com/2012/6/19/python-virtualenv/)) и устанавливаем `django-extensions`:

    pip install django-extensions 

Открываем `settings.py` нашего проекта и добавляем `django-extensions` в `INSTALLED_APPS`. Теперь на очереди `pygraphviz`:
    
    pip install pygraphviz

Вот теперь готово, попробуйте следующие две команды:

    python manage.py graph_model -a -g -o all_models.png
    python manage.py graph_model my_app -g -o my_app_models.png
 
Первая отрисует все модели, какие только есть в вашем проекте, а вторая отрисует только модели из определенных приложений. Все! Теперь можно распечатать эту красоту и делать вид, что занят проектированием, развалившись на [бинбэге](http://ru.wikipedia.org/wiki/%D0%91%D0%B8%D0%BD%D0%B1%D1%8D%D0%B3). 