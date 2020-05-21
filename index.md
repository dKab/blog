---
layout: layout.liquid
pageTitle: Welcome to my blog
---
[About me](/about/)

{%- for post in collections.posts -%}
    <h3><a href="{{ post.url }}">{{ post.data.pageTitle }}</a></h3>
    <em>{{ post.date | date: "%Y-%m-%d" }}</em>
{%- endfor -%}