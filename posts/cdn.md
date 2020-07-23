---
date: 2020-07-22
pageTitle: On CDN cache management
syntaxHighlightEnabled: true
SEO_Description: This post describes a simple way to purge CDN cache when a page changes on a static site. A Node.js script executed by CI server upon deployment inspects a special file in the root of the project that should contain a list of URLs that has to be purged. A pre-commit git hook is used to make sure that the list of URLs is updated with each change.
---

${toc}


## The problem of CDN cache purging

I use [CDN](https://en.wikipedia.org/wiki/Content_delivery_network) to improve page load times by caching all static assets on CDN servers. [Cloudflare CDN](https://www.cloudflare.com/cdn/) that I've chosen for this blog has a free plan, which is more than enough for a simple site like this one. And since my site is static I can cache pretty much everything from images to javascript to HTML. This is the beauty of static sites.

Caching is great but you can burn yourself if you are not careful and forget to invalidate or "purge" cache when a cached resource changes. In this case, the user will see an outdated version of the resource. Ouch!

Normally I would have to purge cache only when I add a new blog post, and the only page that would need to be purged is the home page because it shows the list of all posts. However, so far I've been purging cache extensively for pretty much every page at different times. Sometimes I would find a typo in one of my posts and I'd go and update it. Also, I regularly do some small improvements on the site, and some changes affect all the pages, e.g. a change in the main layout template, which is shared by all pages. So without a way to purge cache easily, I would tire myself pretty quickly. 

Cloudflare provides two ways to purge cache: manually through their web interface and via API. With both methods, you have an option to purge everything and an option to purge URLs one by one. I hardly ever need to purge everything (because everything means EVERYTHING, including images and js), so most of the time I have to specify URLs.
The obvious problem with the manual approach is that it's very tedious. You have to open the browser, go to your Cloudflare control panel, type in all the URLs that were changed and click purge. Besides, I have to specify two URLs for each page that has changed because my site can be accessed either with or without the "www" subdomain. So If I change something on my "About" page I have to specify

    https://kabardinovd.com/about/
    https://www.kabardinovd.com/about/

This fact makes manual cache purging practically unusable for me.

Using API is much more convenient because it enables automation. Instead of writing two full URLs for every page, I can just specify a shorter relative URL like `/about/` and have a script prefix it with domain and duplicate it for the "www" version. 

But I still have to specify these URLs, which is not ideal. I would like to not worry about it at all and have a mechanism that could understand which URLs have to be purged by looking at what files have been changed in the new revision. I thought about it a little and concluded that even if it was possible it would probably be very time-consuming to make it work reliably. I'd need to maintain some kind of a file-to-URL map with some logic on top of it because the relation is not that simple. For example, if I change a post, I can't tell if I have to purge the URL for the post's page only or the home page URL has to be purged as well. It depends on what exactly I have changed in the file — if the title was changed, then the home page needs to be updated. 

## The solution
With this in mind, I decided to not overengineer things and settled for a simpler solution, which didn't require a lot of work. It consists of two parts:

1. `urls-to-purge.txt` file in the root of the project
2. `purge-cdn-cache.js` script, which is executed by AWS CodeDeploy (CI)

Whenever I change something, I just need to update the `urls-to-purge.txt` with the list of the URLs that need to be purged and commit it with the rest of the changes. It's easy for me to do because I know which files affect what URLs and because I can do it seamlessly in my code editor without having to switch windows.

When I push the changes CI server will call `purge-cdn-cache.js` as the last step of the blog's deployment process. `purge-cdn-cache.js` will look at `urls-to-purge.txt` and make a call to Cloudflare API with all the URLs. To make my life a bit easier I added a couple of aliases that get translated to several URLs at once. For instance, if I need to purge cache for all posts, which is a pretty common case, I can just write `All posts` in my `urls-to-purge.txt`.

Here's what contents of `urls-to-purge.txt` could look like if, for example, I made a change to my "About" page and one of my posts:

    /about/
    /posts/first-post/

Then `purge-cdn-cache.js` script would transform it to 

    https://www.kabardinovd.com/about/
    https://kabardinovd.com/about/
    https://www.kabardinovd.com/posts/first-post/
    https://kabardinovd.com/posts/first-post/

and send the request to Cloudflare API.

And this is what's inside my `purge-cdn-cache.js`:

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

## Git hook as a safety net

The only problem with this solution is that I can forget to update `urls-to-purge.txt` when I change something. And it happened to me several times. But not anymore. I just had to add pre-commit git hook that would check if `urls-to-purge.txt` is staged and block the commit if it's not. I used [husky](https://github.com/typicode/husky) to write the hook in JavaScript. To get the list of staged files from Node.js I used a handy library called [simple-git](https://github.com/steveukx/git-js). Here's the script that gets called by `husky` and runs the check:

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
 
Of course, there are cases when it's legit to not update `urls-to-purge.txt.` In such cases, I just have to run `git commit` with `--no-verify` option to bypass the hook. And that's it.

Thanks for reading, and until next time. Cheers.