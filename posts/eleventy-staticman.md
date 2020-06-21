---
date: 2020-06-21
pageTitle: Building a static blog with Eleventy and Staticman 
syntaxHighlightEnabled: true
---

${toc}

Hi, today I wanted to talk about static sites since this site is static. I'll tell you about two key technologies this blog is built with — 11ty and Staticman.

But, first, what exactly is a static site?

### Why static site

Most of the websites that provide a personalized experience (that you can log in to), are **dynamic** websites, meaning, they rely on some dynamic data and are rendered either on the server or in the browser on the fly when a page is requested. Upon receiving a request backend would query some database or API to retrieve the data needed to render the requested HTML page.
Whereas a **static** site is just a set of HTML pages, pre-rendered in advance. When the request comes to the server, we don't have to do anything other than just send the requested HTML file in response. As you can imagine, it saves a lot of time, that would be otherwise spent on querying the database or API and generating result HTML, therefore, in terms of performance, nothing beats pre-rendered static web-pages. But if that weren't enough static sites open a unique opportunity to reduce waiting time for users even more. I'm talking about CDN or Content Delivery Network. Dynamic sites can use CDN to speed up delivery of their static resources — images, fonts, stylesheets, and javascript but that's all that CDN can do for a dynamic site. With static sites, however, you can go further and cache the HTML pages as well. That's what I'm doing for this blog and I'm going to talk about it more in one of the future posts. 

But the simplicity of static sites have other advantages besides performance. The fact that the whole thing is just files stored in Git makes the installation process a lot easier and offers additional flexibility with hosting providers — you don't depend on any particular database or programming language and in fact, it's possible to host static site even on Amazon S3 — a Simple Storage Service or GitHub pages, which many people do.

Of course, the area of application of static sites is fairly limited, but for many common purposes such as blogs, documentation sites, promotional landing pages, or personal pages static site is probably the best choice.

### 11ty

Static sites don't require any special tool to build them because all they are is just a good old HTML, CSS, and maybe some JavaScript, and of course a developer can write everything by hand if they want. However, a static site generator or SSG can make life much easier, because it can do a lot of work for you. Most of SSGs support some template engines like liquid, nunjucks, twig, handlebars, etc., which are kind of special languages that you can use to inject data into your pages. What SSGs do is they take templates written in one of these languages and translate them into HTML pages, ready to be served to the client. For blogging, what comes especially handy is the possibility to write posts in markdown and have them transpiled to HTML.

You can do all sorts of things during build time, you can even use dynamic(ish) data in your static site if you want. Say you want to show a list of movies and you want to draw their ratings from some API. A movie rating is an example of data that doesn't change significantly overnight so we don't need actual real-time data in this case. All we need is to update value, say, every day. We can have our static site generator query the API at build time and populate our page with recent values. Then we can configure our server to do automated rebuilds by cron every day and voilà — we have reasonably fresh data and we haven't sacrificed page loading speed. Pretty neat, huh? In my case, I don't need to query any API or database during build time, since my posts are just markdown files stored in Git.

I' haven't used any static site generator before, even though they've been around for a while now. So I've started looking and, apparently [there's no shortage of options](https://github.com/myles/awesome-static-generators) when it comes to choosing an SSG. For blogs in particular, however, there's one tool that stands out in terms of popularity and it's [Jekyll](https://jekyllrb.com/). It was one of the first SSGs to appear and it remains very relevant even now, after many years and with so many competitors. And I seriously considered using Jekyll for this blog, because as with any popular technology, it's easy to find help, it has a mature ecosystem, a lot of plugins, many tutorials. For me, however, there's one deterrent for using Jekyll and it's the fact that it's written in Ruby, and don't get me wrong, I don't have anything against Ruby, it's just I'm not as comfortable with it as I am with Node.js. The idea of having to install ruby both on my machine and on the server, to deal with its gems and all that was not a very cheerful perspective. So naturally, before settling down with Jekyll, I decided to look some more for something similar but written in Nodejs. And sure enough, I found it. Meet, [eleventy](https://www.11ty.dev/). I've picked it and haven't regretted it once so far. It's pretty intuitive — I've been able to set up a basic blog skeleton in about 20 minutes or so.

### Staticman for comments

Commenting is a tricky subject in the context of static web sites because to have comments, typically you need a database and some backend since you have to somehow  handle form submission event and store the comment. But static sites don't bother themselves with backend logic and databases, so, too bad, right? Well, there's an alternative, we can use 3rd party things like Disqus. Disqus provides a javascript that you include on your page. This script constructs a section with comments and attaches it to your page, as well as handles comment form submission, saving the comments on their servers. However, using Disqus is probably [not such a good idea](https://fatfrogmedia.com/delete-disqus-comments-wordpress/). First of all, Disqus is not free, unless of course, you want to show ads to your users. Second, you don't control the visual design of the comments section. So, there's plenty of reasons not to use Disqus, but hey, what are we left with? Meet, [Staticman](https://staticman.net/)!
I can't explain what it is better than their GitHub page does, so I'll just cite it here:

> Staticman is a Node.js application that receives user-generated content and uploads it as data files to a GitHub and/or GitLab repository. In practice, this allows you to have dynamic content (e.g. blog post comments) as part of a fully static website, as long as your site automatically deploys on every push to GitHub and/or GitLab

Sounds great, right? I was sold instantly! My experience with it didn't start smoothly though, as I was soon to find out that documentation on their web-site was outdated and therefore misleading. Fortunately, I found [this blog post](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html) where the author describes in detail how he integrated Staticman with his Jekyll-based blog. Honestly, if it wasn't for this post and several others, that it references, I wouldn't be able to figure out how to configure Staticman on my own. It helped me immensely. I admit, the lacking documentation issue is a little bit annoying, but I am in no position to complain, after all, it's an independent open-source project and I can see how developers may not have enough time to keep docs up to date. I'm just grateful for the project and that it's free and open-source. 

In a nutshell, it works like this.
Staticman is a web service that provides a REST API for handling POST requests from your form. You can run it on Heroku and that's how I do it, but you can also run it on your infrastructure if you want.
When it receives a request with a new comment it runs validation and creates a pull request to your site's GitHub repository on behalf of special bot user, which you add to your repo's collaborators list.

You can then merge or decline the PR and it serves as moderation for the comments. You can choose to skip the moderation step and allow Staticman to merge to your default branch directly. I prefer to have moderation enabled though, as it seems more secure and I don't expect a flood of users any time soon, so it's not going to bother me frequently.

One way or another, after the comment data is merged into your repo, SSG will rebuild your site (provided that you have configured redeploy on push) using this data and you'll have your comment on the page. I think the idea is just brilliant.

It's important to note that Staticman doesn't concern itself with how you are sending your comments to its web-service, so it doesn't include any frontend — this part is on you. It's both good and a bad thing, depending on a perspective — on the one hand, you are free to build UI that you like, but on the other hand, well, you need to do it yourself. I was too lazy to write comment form so I just borrowed liquid templates from the repo of the guy that wrote the post, that I mentioned above, which I think he borrowed from some other guy.
It's never that simple though, as the templates were Jekyll-oriented, and even though 11ty is very similar to Jekyll they are different in a very important way. Jekyll is shipped with many useful filters that can be used inside liquid templates — utilities for date formatting, transformations of URLs to absolute or relative format [and so on](https://jekyllrb.com/docs/liquid/filters/). 11ty doesn't have it out of the box, so, naturally, the templates taken from Jekyll-based site didn't work for me right away. So I had to add all the missing parts first, thankfully, 11ty makes it very easy to do so. And this is where the advantages of 11ty being built with Node.js start to be clearly seen — it's very easy to extend with a just a little bit of JavaScript that you add into your `.eleventy.js` file. Here is a snippet of code from my `.eleventy.js` where I specify some filters for my templates, analogs of which can be found in Jekyll:

``` js
const format = require('date-fns/format');

module.exports = function(eleventyConfig) {
    eleventyConfig.addFilter('where', (array, key, val) => {
    return array.filter(item => item[key] == val)
  });

  eleventyConfig.addFilter('formatDate', (dateOrTimestamp, formatString) => {
    let date;
    if (typeof dateOrTimestamp === 'number') {
      date = new Date();
      date.setTime(dateOrTimestamp * 1000);
    } else {
      date = dateOrTimestamp;
    }
    return format(date, formatString);
  });

  eleventyConfig.addFilter('sortBy', (array, key) => {
    return array.slice().sort(function(a,b) {
      return a[key] - b[key];
    })
  });
  eleventyConfig.addFilter('absoluteUrl', (url) => 
    `https://kabardinovd.com${url}`
    );
}

```

That's not the only kind of change that I had to make to the templates though as apart from 11ty missing filters that Jekyll has, there are a few more subtle differences between the two SSGs, and [this article](https://24ways.org/2018/turn-jekyll-up-to-eleventy/) helped me tremendously in identifying them and making appropriate adjustments. So eventually, I was able to port Jekyll-oriented liquid templates to my 11ty blog and was very happy about that, even though it took some time to do it. If you are looking for templates for Staticman comments to integrate into your 11ty blog and you don't feel like writing them yourself or just need a starting point from where you could customize, you are welcome to check out my [_includes](https://github.com/dKab/blog/tree/master/_includes) folder.

There's one more thing that I want to do concerning comments and that's to get rid of jQuery dependency that migrated to my blog along with the liquid templates. since the comment form relies on it for reply functionality and modal dialogs. When I'm done with it, I'm going to write a short post about it as well. 

Hope you enjoyed reading this, comments and feedback are welcome. Stay safe and see you later.


