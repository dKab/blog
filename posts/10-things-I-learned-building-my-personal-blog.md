---
date: 2020-11-07
pageTitle: 10 Things I've Learned While Building A Website For My Blog 📚
syntaxHighlightEnabled: true
SEO_Description: Choosing to build a website for a personal blog can prove to be beneficial because it's a great learning opportunity. Here's a list of 10 things, that I've learned building a web-site for the static blog. 
---

<style>
ol {
  list-style: none;
}
</style>

${toc}

If you are thinking about starting a blog one of the first decisions you have to make is where to host it. If you want to just focus on writing it's perfectly fine to opt for ready-to-use blogging platforms. However, if you have some basic knowledge of HTML and CSS, building a website for your blog from scratch is a good way to grow as a developer. Below is the list of things that I haven't had practical experience with until I've started building my blog.

## 1. Eleventy and liquid templates

I haven't used static site generators before, and for a long time, I've been curious, what they are about. It was nice to finally try one out. I've written a detailed [post](/posts/eleventy-staticman/) about it, all I will say here is that static site generators and namely Eleventy is my favorite tech thing of 2020. Eleventy is so much fun that I have this urge to build more static sites with it.

## 2. Lighthouse

From the start, I've been focused on performance for my blog, so, naturally, I had to try Lighthouse, which I've heard a lot about but never actually used myself. And after having tried it I've got to say it's great.
It helps you avoid the most common pitfalls by running a set of audits on your site and generating neat reports with links to learning materials on each problem. Tackling all of them and getting to that precious "100" score is no easy feat, but it will most certainly improve your site's user experience and ensure fast loading. From now on I'm going to use Lighthouse on all my projects. By the way, Eleventy has a [Performance Leaderboard](https://www.11ty.dev/speedlify/) of the sites built with it. You can submit your site to participate and it will be ranked according to the Lighthouse score.

<figure>
    <img src="/assets/images/Lighthouse.PNG" alt="Four numbers in green circles in a row. Each stands for Performance, Accessibility, Best Practices and SEO Lighthouse score" />
    <span class="image-caption">Lighthouse score example from one of my post pages</span>
</figure>

## 3. Accessible colors

Accessibility is another thing that I tried to keep tabs on during this blog's development. I've expanded my understanding of accessibility beyond just using ARIA attributes. Trying to tick all the boxes for the Lighthouse accessibility audit I learned about color contrast standards. I relied heavily on an awesome tool https://accessible-colors.com/ to make my color scheme AA compliant. It can recommend you necessary adjustments to the color to make the contrast ratio high enough so that your content is discernable for people with all kinds of vision impairments.

## 4. Responsive images
My current project at my job is more of a web-application than a traditional web-site and we barely use images there, let alone large images. So I didn't need responsive images. A blog is a different story though.
An image is worth a thousand words as an old saying goes. I like to break a long post with an image illustrating the idea I'm describing, and I know that some part of traffic to my site comes from smartphones. It would be a waste to serve large images to clients with small screens. Enter responsive images. With a `<picture>` tag I can serve different images depending on the size of the screen like this:

``` html
  <picture>
    <source srcset="/assets/images/PR.PNG" media="(min-width: 800px)" />
    <source srcset="/assets/images/PR-cropped-1.png" media="(max-width: 800px)" />
    <img src="/assets/images/PR-cropped-1.png" alt="Screenshot of a PR with comment data made by Staticman" /> 
  </picture>

```

## 5. CSS variables

I'm used to working with CSS preprocessors at my job. We use SASS on my current project, and it was Less on the previous one. Until I started working on this blog I can't remember when was the last time I wrote vanilla CSS. Meanwhile, CSS hasn't stopped developing and there's a lot of stuff that CSS supports natively now, which was only possible through preprocessors before. One example would be the variables. Dark/Light mode toggle implementation on this site relies on CSS variables. Who knows, maybe one day we won't need CSS preprocessors at all.

## 6. Font subsetting and variable fonts

While I was implementing the dark mode I have noticed that the same font-weight seemed too thick when it was white text on a dark background. Apparently [it's a thing](https://css-tricks.com/dark-mode-and-variable-fonts/#comment-1757496). I've found an [article](https://css-tricks.com/dark-mode-and-variable-fonts/) with a solution for this issue that uses a variable font. The trick is to decrease font-weight via CSS. Unlike regular fonts, which don't support font-weight values smaller than 400, variable fonts allow any number within the font's width range as font-weight value. But there was one problem. For a long time, I was afraid of using web fonts because of their detrimental effect on page loading time. But to be able to adjust font-weight in dark mode I had no choice but to use a web font. So I started researching how to make web fonts load fast, and it led me to learn about [font subsetting](https://www.afasterweb.com/2018/03/09/subsetting-fonts-with-glyphhanger/) – a technique of stripping the font file of the unnecessary characters to make it slimmer. Glyphnanger is a great tool for that. After having used it for my blog and seeing an impressive decrease in the font file size, I'm no longer afraid of using web fonts.

## 7. Systemd

To keep my Node.js HTTP server running I had to learn how to register services with Linux init system - systemd. Eventually, [I switched to NGINX from Node.js](/posts/server/), making this work obsolete, but hey, it was still an interesting and informative experience. Before that, I only used things like PM2 for managing Node.js processes.

## 8. CDN

CDN is an important part of JAMstack, so I had to learn how to use CDN if I wanted to get into the cool kids club. Just kidding, haha. On a more serious note, though, until now, my experience with CDNs went only as far as importing popular libraries from CDN servers instead of serving them from your host. For this blog, however, I went further and made it so that all the traffic to my server was managed by Cloudflare CDN. To do that I had to update NS records for my domain with Cloudflare nameservers. These nameservers return Cloudflare IP addresses when DNS lookup for my domain happens. Proxied traffic comes to Cloudflare edge servers and then they forward the request to my server. It helps me to improve my website page's loading time by serving cached versions of the pages. While this is awesome, it brought new challenges, such as a problem of cache purging. I had to implement a mechanism that uses Cloudflare API to purge cache on redeploy. If you are interested in details, I wrote a [post describing my approach](/posts/cdn/).

## 9. Amazon Web Services

I've been somewhat familiar with AWS as I encountered it at my job, but as a frontend engineer, I have never been involved in the cloud infrastructure setup too much. Hosting my blog on AWS EC2 forced me to dig into AWS docs and do everything myself, starting from registering a domain on their Route 53 to learning how to use [CodeDeploy](https://aws.amazon.com/ru/codedeploy/) and [CodePipline](https://aws.amazon.com/ru/codepipeline/) services to setup CI/CD so that I could redeploy just by pushing the code into the main branch. I had to figure out how to store secrets with their Systems Manager parameter store (I need to store Cloudflare API token for automatic cache purging on deploy). After having to do all of that, I feel much more comfortable with the AWS console.

## 10. SEO

At my job, I build web-apps for internal usage that are not exposed to the Internet, and therefore Search Engine Optimization is not something that we think about. Building a web site for a blog is different because, usually, you want your articles to be discovered through search engines. So I had to learn at least basic things about SEO, like adding description in meta tags or generating a sitemap for crawlers, or what a canonical link is.

And this concludes my list. Yours will most certainly look different because we are all unique and each has different background and experience. But one thing is for sure - if you choose to build a site for your blog, you **will** learn something.