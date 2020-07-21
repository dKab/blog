---
date: 2020-07-20
pageTitle: On CDN cache management
syntaxHighlightEnabled: true
SEO_Description: 
---

${toc}

I use [CDN](https://en.wikipedia.org/wiki/Content_delivery_network) to improve page load times by caching all static assets on CDN servers, which are closer to the user than the original server. 

  I chose [Cloudflare](https://www.cloudflare.com/cdn/) as a CDN provider for this blog. Their free plan is more than enough for a simple and not very popular site like this one. Since this blog is static I can cache pretty much everything from images to javascript to HTML. This is the beauty of static sites. However, by default, Cloudflare only caches resources that are typically static: images, javascript, stylesheets, pdf and word documents, etc., but not HTML. To change this I had to create a page rule and configure it to cache everything.

<figure>
  <picture>
    <source srcset="/assets/images/modal.png" media="(min-width: 800px)" />
    <source srcset="/assets/images/modal-small.png" media="(max-width: 800px)" />
    <img src="/assets/images/modal-small.png" alt="Screenshot of a modal window, using Micromodal module" /> 
  </picture>
  <span class="image-caption">New look of the modal window</span>  
</figure>


A page rule is a pattern and a set of settings that should apply for all the pages that match this pattern. I have only one page rule, which matches everything on my domain, but it's possible to have up to 3 rules on a free plan for more granular control.

Caching is great but you can burn yourself if you are not careful and forget to invalidate or "purge" cache when a cached resource changes. In this case, user will see an outdated version of the resource. Ouch!

Normally I would have to purge cache only when I add a new blog post, and the only page that would need to be purged is the home page because it shows the list of all posts. However, so far I've been purging cache extensively for pretty much every page at different times. Sometimes I would find a typo in one of my posts and I'd go and update it. Also, I regularly do some small improvements on the site, and some changes affect all the pages, e.g. when I change the main layout template, which is shared by all pages. So without a way to purge cache easily, I would tire myself pretty quickly. 

Cloudflare provides two ways to purge cache: manually through their web interface and via API. With both methods, you have an option to purge everything and an option to purge URLs one by one. I hardly ever need to purge everything (because everything means EVERYTHING, including images and js), so most of the time I have to specify URLs.
The obvious problem with the manual approach is that it's very tedious. You have to open the browser, go to your Cloudflare control panel, type in all the URLs that were changed and click purge. Besides, I have to specify two URLs for each page that has changed because my site can be accessed either with or without www subdomain. So If I change something on my "About" page I have to specify

https://kabardinovd.com/about/
https://www.kabardinovd.com/about/

This fact makes manual cache purging practically unusable.
Using API is much more convenient because I can utilize the power of automation. Instead of writing two full URLs for every page, I can just specify a shorter relative URL like `/about/` and have a script prefix it with domain and duplicate it for www version before sending the request with the list of URLs that need to be purged. 

But I still have to specify these URLs, which is not ideal. I would like to not worry about it at all and have a mechanism that could understand which URLs have to be purged by looking at what files have been changed in the new revision. I thought about it a little and concluded that even if it was possible it would probably be very time-consuming to make it work reliably. I'd need to maintain some kind of a file-to-URL map with some logic on top of it because the relation is not that simple. For example, if I change a post, I can't tell if I have to purge the URL for the post's page only or the home page URL has to be purged as well. It depends on what exactly I have changed in the file — if the title was changed, then the home page needs to be updated.

So for now I settled for a simpler solution, which didn't require a lot of work. It consists of two parts:

1. `urls-to-purge.txt` file in the root of the project
2. `purge-cdn-cache.js` script, which is executed by AWS CodeDeploy (CI)

Whenever I change something I just need to update the `urls-to-purge.txt` with the list of the URLs that need to be purged and commit it with the rest of the changes. It's easy for me to do because I know which files affect what URLs and because I can do it seamlessly in in my code editor without having to switch windows.

 When I push the changes CI server will call `purge-cdn-cache.js` as the last step of the blog's deployment process. `purge-cdn-cache.js` will look at `urls-to-purge.txt` and make a call to Cloudflare API with all the URLs. To make my life a bit easier I added a couple of aliases that get translated to several URLs at once. For instance, if I need to purge cache for all posts, which is a pretty common case, I can just write `All posts` in my `urls-to-purge.txt`.

 So here's what can be inside `urls-to-purge.txt` if, for example, I made a change to my "About" page and one of my posts:

 /about/
 /posts/first-post/

`purge-cdn-cache.js` script will transform it to 

'https://www.kabardinovd.com/about/'
'https://kabardinovd.com/about/'
'https://www.kabardinovd.com/posts/first-post/'
'https://kabardinovd.com/posts/first-post/'

and send the request to Cloudflare API.

And this is what's inside `purge-cdn-cache.js`:

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
axios // axios is just a utility for making http requests
.post(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, body, {headers})
.then(() => {
    fs.writeFileSync('deploy-logs.txt', `
    purged cache for the following urls:
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

The only problem with this solution is that I can forget to update `urls-to-purge.txt`. And it happened to me several times. But not anymore. It was an easy problem to solve. I just had to add pre-commit git hook that would check if `urls-to-purge.txt` is staged and block the commit if it's not. I used [husky](https://github.com/typicode/husky) to write the hook in JavaScript. To get the list of staged files from Node.js I used a little library called [simple-git](https://github.com/steveukx/git-js). Here's the script that gets called by `husky` and runs the check:

``` js
const git = require('simple-git/promise')

let error = null

async function validateChanges() {
    // Check if there are any files staged
    const diffSummary = await git().diffSummary(['--staged'])
    if (diffSummary.files.length === 0) {
        return
    }

    const URLsFile = diffSummary.files.find(f => Object.is(f.file, 'urls-to-purge.txt'))
    if (URLsFile === undefined) {
        error = 'The urls-to-purge.txt is not staged. Did you forget to update it?'
        return
    }
}

validateChanges()
.then(() => {
    if (error !== null) {
        console.log('Error: ' + error)
        process.exit(1)
    }
    console.log('urls-to-purge.txt is staged. Everything is OK.')
})
.catch((err) => {
    console.error(err)
})

```

Of course, there are cases when it's legit to not update `urls-to-purge.txt.` In such cases, I just have to run git commit with `--no-verify` option. And that's it.

Thanks for reading the post till the end, hope you enjoyed it, and I'll see you soon. Cheers.