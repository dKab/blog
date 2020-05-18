# Automatic CDN cache purging on deploy

Whenever I commit changes to a page I need to add the page's url to ```urls-to-purge.txt``` (and remove old urls from previous commit that shouldn't be purged!)

- When specifying urls for purge, don't forget to add trailing slashes for urls that have them!

- Also if you change a title of a post, purge cache for home page as well!

- I need to specify both **www** and **non-www** urls for the same page, because the site is accessible either way and these are different urls!