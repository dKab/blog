---
layout: layout.liquid
pageTitle: Posts
SEO_Description: A blog about web-development and everything related. 
---
<ul class="posts-list">
{%- for post in collections.posts reversed -%}
    <li>
        <span class="post-date">{{ post.date | formatDate: "dd MMM yyyy" }}</span>
        <h2 class="post-title"><a href="{{ post.url }}">{{ post.data.pageTitle }}</a></h2>
    </li>
{%- endfor -%}
</ul>

Subscribe to [RSS feed](/feed.xml)