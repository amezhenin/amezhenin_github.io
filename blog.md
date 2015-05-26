---
layout: index
title: Blog
tagline:
published: true
group: navigation
---

  <style>
   span:empty {
    margin-left: 10px;
    display: inline-block;
   }
  </style>

<ul class="posts">
<table>
  
  {% for post in site.posts %}

  {% if post.tags[0] == "popular" %}  
  <tr style="font-weight:800;">
  {% else %}
  <tr>
  {% endif %}

    <td><li><span>{{ post.date | date: "%B" }}&nbsp;</span></li></td>
    <td><span>{{ post.date | date: "%Y" }}</span></td>
    <td>&raquo;&nbsp;</td> 
    <td><a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></td>
    <td></td>
  </tr>


  {% endfor %}
</table>
</ul>


