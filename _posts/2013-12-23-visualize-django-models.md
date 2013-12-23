---
layout: post
title: "Визуализация моделей Django"
description: ""
category: django
tags: [django, python]
published: false
---
{% include JB/setup %}

Я уже давной использую одно замечатльное расширение для визуализации Django моделей. Иногда на меня навадает тоска и отвращение к монитору и хочется поводить карандашем по бумаге. Особенно здорово, если на бумаге уже присутствуют те наработки, которые у Вас есть. 

Настройка довольно проста, для начала установим `libgraphviz-dev` и `graphviz` из репозитория. У меня Ubuntu, поэтому я делаю это так(*в общем-то как все ;-)*):

    sudo apt-get install libgraphviz-dev graphviz

Окей, теперь идем в виртуальное окружение, если вы таким пользуетесь(а если не пользуетесь то вам давно пора начать) и устанавливаем `django-extensions`:

    pip install django-extensions 

Открываем `settings.py` нашего проекта и добавляем `django-extensions` в `INSTALLED_APPS`. Теперь на очереди `pygraphviz`
    
    pip install pygraphviz

Вот теперь готово, попробуйте следующие две команды:

    python manage.py graph_model -a -g -o all_models.png
    python manage.py graph_model my_app -g -o
 my_app_models.png
 
Первай отрисует все модели, какие только есть в вашем проекте, а вторая отрисует только модели из определенных приложений. Все! Теперь можно распечатать эту красоту и делать вид, что занят проектированием, развалившись на бинбаге. 