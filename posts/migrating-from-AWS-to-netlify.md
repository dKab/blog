---
date: 2021-04-29
pageTitle: Bye-bye AWS, Hello Netlify!
syntaxHighlightEnabled: false
SEO_Description: I've migrated my blog from AWS EC2 to Netlify. Here's how it went.
---

About a week ago I received an email from AWS saying that my free tier period was coming to an end, which was bad news for me cause I liked not paying for hosting! 😄 But on the bright side, this meant that my blog was created around this time a year ago, so I guess I can celebrate a 1-year birthday, hooray!

Anyhow. I decided to move from Amazon cloud services to Netlify because I don't want to pay for something I can get for free elsewhere. I chose AWS EC2 as a hosting for my blog in the first place because I thought I would use my private instance for something else besides hosting my static blog, but that never happened, so there was no point in continuing using it when it was going to cost me money.

Netlify is a web development platform that provides all sorts of services for web developers, including hosting, CDN, serverless functions, etc. And if you are wondering if they are affiliated with Netflix, it seems that they are not. At least my googling on that topic was fruitless, which is weird, if you ask me, cause I would expect more people asking the same question considering how suspiciously similar the names are. But I digress... What else do I know about Netlify? Well, If I'm not mistaken it was people from Netlify who first coined the term Jamstack, and they seem to promote this way of building websites by letting people host their static sites on Netlify for free. I know many writers who host their blogs there and I've only heard positive feedback so far, so I decided to try it too since I needed to find a new home for my site anyways.

The migration process went pretty seamlessly. It's actually mindblowing how easy it is to host a site there. You create an account, connect it to your GitHub, point it to a repo with your static site, tell it which command to run each time you push to the main branch, and... that's it.

I had a slight hiccup with changing the nameservers for my custom domain from the ones provided by Cloudflare to the Netlify ones,  and I messed it up in my AWS console (my domain is registered by AWS Route 53 Registrar, so managing it is done via AWS console, which can be confusing at times). So I ended up having a couple of days of downtime when my blog wasn't accessible during the transition until I finally figured it out and now everything is fine.

My site still seems to load pretty fast, so I'm satisfied with my new hosting.
