---
layout: post
title: "visualize django models"
description: ""
category: django
tags: [django, python]
published: false
---
{% include JB/setup %}

* sudo apt-get install libgraphviz-dev graphviz
* pip install django-extensions
* Add to INSTALLED_APPS
* pip install pygraphviz
* python manage.py graph_model -a -g -o all_models.png
* python manage.py graph_model my_app -g -o my_app_models.png