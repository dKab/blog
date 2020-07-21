---
date: 2020-07-20
pageTitle: On CDN cache management
syntaxHighlightEnabled: true
SEO_Description: 
---

${toc}

I use [CDN](https://en.wikipedia.org/wiki/Content_delivery_network) to improve page load times by caching all static assets on CDN servers, which are closer to the end user than the original server. 

There are different companies that provide CDN services, but I chose [Cloudflare](https://www.cloudflare.com/cdn/) as a CDN provider for this blog. Their free plan is more than enough for a simple and not very popular site like this one. Since this blog is static I can cache pretty much everything from images to javascript to HTML. This is the beauty of static sites. However, by default, Cloudflare only caches resources that are typically static: images, javascript, css, pdf and word documents, etc., but not HTML. To change this you have to create a page rule and configure it to cache everything.

<figure>
  <picture>
    <source srcset="/assets/images/modal.png" media="(min-width: 800px)" />
    <source srcset="/assets/images/modal-small.png" media="(max-width: 800px)" />
    <img src="/assets/images/modal-small.png" alt="Screenshot of a modal window, using Micromodal module" /> 
  </picture>
  <span class="image-caption">New look of the modal window</span>  
</figure>


A page rule is pattern and a set of setting that should apply for all pages that match this pattern. I have only one page rule which matches every page on my domain, but you can have up to 3 rules on a free plan.

Caching is great but you can burn yourself if you are not careful and forget to invalidate or "purge" cache when cached resource changes. In this case user will see an outdated version of the resource. Ouch!
Normally I would have to purge cache only when I add a new blog post and the only page that would need to be purged is home page, because it shows the list of all posts. However so far I've been purging cache extensively for pretty much every page at different times. Sometimes I would find a typo in one of my posts and I'd go and update it. Also, I regularly do some small improvements on the site, and sometimes changes affect all the pages, e.g. when I change layout template, which is shared by all pages. So without a way to purge cache easily I would tire myself pretty quickly. 

Cloudflare provides two ways to purge cache: Manually through their web interface and via API. With both methods you have an option to purge everything and an option to purge URLs one by one. I hardly ever need to purge everything, so I have to specify URLs. The obvious problem with manual approach is that it's very tedious. After I commit nd push my changes I have to open browser, go to cloudflare control panel, type in all the URLs that were changed and click purge. I actually have to specify two URLs for each page that changed because my site can be accessed either with or without www subdomain. So If I change something on my about page
I have to specify

https://kabardinovd.com/about/
https://www.kabardinovd.com/about/

Using API is much more convenient because instead of writing two full URLs for every page I can just specify a shorter relative URL like `/about/` and have a script prefix it with domain and duplicate it for www version before sending the request with the list of URLs that need to be purged. But I still have to specify these URLs, which is not ideal. I would like to not worry about it at all and have a mechanism which could understand which URLs have to be purged by looking at what files have been changed in the new revision. I thought about it a little and concluded that even if it was possible it would probably be very hard to make it work reliably.

So for now I settled for a simpler solution, which kind of works for me and didn't require a lot of thinking. It consists of two parts:

1. `urls-to-purge.txt` file in the root of the project which holds the list of urls that need to be purged.
2. `purge-cdn-cache.js` script which is executed by AWS CodeDeploy (CI).

Whenewer I change something I just need to update the urls-to-purge.txt with the list of urls that need to be purged and commit it with the rest of the changes. It's easy for me to do because I know which files affect what URLs and because I can do it seamlessly in VScode without having to switch windows.

 When I push the changes CI will call `purge-cdn-cache.js` as the last step of my deployment proccess. `purge-cdn-cache.js` will look at `urls-to-purge.txt` and make a call to cloudflare API with all the URLs. To make my life a bit easier it can understand a couple of aliases for matching a several urls at ones. For instance if I need to purge cache for all posts, which is pretty common case, I can just write `All posts` in my `urls-to-purge.txt`.

 So here's  what can be inside `urls-to-purge.txt` If for example I made a change to my "About" page and one my posts:

 /about/
 /posts/first-post/

 the script will transform it to 

'https://www.kabardinovd.com/about/'
'https://kabardinovd.com/about/'
'https://www.kabardinovd.com/posts/first-post/'
'https://kabardinovd.com/posts/first-post/'

and send the request.

Here's the code:
``` js
const urls = fs.readFileSync('urls-to-purge.txt', 'utf8')
    .toString()
    .split('\n')
    .map(line => line.trim());

if (urls.length === 0  || (urls.length === 1 && !urls[0])) {
    return;
} 

let body, isAll = false;
if (urls.length === 1 && urls[0] === 'All') {
    body = { purge_everything: true};
    isAll = true;
} else if (urls.length > 0) {
    body = { files: urls.reduce((acc, curr) => {
        if (curr === '') {
            return acc;
        } else if (curr.toLowerCase() === 'all posts') {
            const allPosts = getPostsURLs();
            acc.push(...allPosts);
        } else {
            const path = curr === '/' ? '' : curr;
            acc.push(`https://www.kabardinovd.com${path}`);
            acc.push(`https://kabardinovd.com${path}`);
        }
        return acc;
    }, []) };
}
axios
.post(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, body, {headers})
.then(() => {
    fs.writeFileSync('deploy-logs.txt', `
    Busted cache for the following urls:
        ${isAll ? 'All of them' : urls.join(', ')}
        `);
})
.catch((error) => {
    fs.writeFileSync('deploy-logs.txt',  `
    error: ${JSON.stringify(error)}
    `);
})

function getPostsURLs() {
    const files = fs.readdirSync('posts');
    return files
        .filter((fileNameWithExt) => 
            fileNameWithExt.split('.').pop()
            .toLowerCase() !== 'json')
        .flatMap(fileNameWithExt => {
            const withoutExt = fileNameWithExt
                .split('.').slice(0, -1).join('.');
            return [`https://kabardinovd.com/posts/${withoutExt}/`,
             `https://www.kabardinovd.com/posts/${withoutExt}/`]
        });
}
```

The only problem - can forget -> git hooks