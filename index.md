---
layout: index
title: Блог Меженина Артёма
tagline:
published: true
---

{% include JB/setup %}

  <style>
   span:empty {
    margin-left: 10px;
    display: inline-block;
   }
  </style>

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
