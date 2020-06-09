---
layout: layout.liquid
pageTitle: Posts
---
<ul class="posts-list">
{%- for post in collections.posts -%}
    <li>
        <span class="post-date">{{ post.date | formatDate: "dd MMM yyyy" }}</span>
        <h3 class="post-title"><a href="{{ post.url }}">{{ post.data.pageTitle }}</a></h3>
    </li>
{%- endfor -%}
</ul>