# Automatic CDN cache purging on deploy

Whenever I commit changes to a page I need to add the page's url to ```urls-to-purge.txt``` (and remove old urls from previous commit that shouldn't be purged!)
Urls should not include protocol, nor domain, nor www subdamain, an example:
```/posts/blog-post-2/``` . Use ```/``` for home page

- When specifying urls for purge, don't forget to add trailing slashes for urls that have them!

- Also if you change a title of a post, purge cache for home page as well!

- Leave the file empty if no purging is required
  
- Write single line ```All``` to purge everything (hardly ever needed) 

- Write ```All posts``` on a separate line to purge all post pages 