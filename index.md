---
layout: index
title: Блог Меженина Артема
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
<table>
  
  {% for post in site.posts %}
  <tr>
    <td><li><span>{{ post.date | date: "%B" }}&nbsp;</span></li></td>
    <td><span>{{ post.date | date: "%Y" }}</span></td>
    <td>&raquo;&nbsp;</td> 
    <td><a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></td>
  </tr>
  {% endfor %}
</table>
</ul>


