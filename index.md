---
layout: layout.liquid
pageTitle: Posts
---

{%- for post in collections.posts -%}
    <h3><a href="{{ post.url }}">{{ post.data.pageTitle }}</a></h3>
    <em>{{ post.date | date: "%Y-%m-%d" }}</em>
{%- endfor -%}