---
date: 2020-09-27
pageTitle: 3 Reasons Why You Should Choose NGINX Over Http-server For Your Static Site
syntaxHighlightEnabled: false
SEO_Description: In this article, I compare two HTTP servers - NGINX and http-server - after getting hands-on practical experience with both technologies during the development of this blog.
coverPhoto: safar-safarov-MSN8TFhJ0is-unsplash-resized.jpg
coverPhotoSmall: safar-safarov-MSN8TFhJ0is-unsplash-small.jpg
coverPhotoAltText: A laptop with code editor opened
coverPhotoAuthor: Safar Safarov
---

${toc}

My server went down the other day and since I had to address it anyway, I decided to simplify my setup while I was at it. When I was finished I thought why not write a post describing my initial setup and what I ended up with. If you are choosing a server for your static blog, I hope this article will help you avoid making the same mistakes I made and maybe save you some time.

## Why I went with http-server at first

I host this blog on an instance of AWS EC2, which runs ubuntu. For those who are unfamiliar with AWS EC2, it's a virtual machine that runs in the cloud and that you can do anything you want with. Because of this freedom, when the time came to choose the HTTP server that would serve my static files I had a lot of options. I considered different candidates but there were two clear favorites: NGINX and, perhaps, less known Node.js module called [http-server](https://www.npmjs.com/package/http-server).

Having encountered NGINX on a few work projects, I was somewhat familiar with it, and I knew it could do the job flawlessly. There was just one hurdle associated with it for me - it required some configuring, and I was too impatient for that. I wanted a tool that didn't require any configuration at all. Given a folder, it should start serving files from this folder. In other words, it should JUST WORK. And http-server offered exactly that. I used it a couple of times when I needed a development server for one of my pet projects, and I liked it. Now I wanted to see how it would perform in production. So I picked it over NGINX. 

The image on the package's npm page reassured me once more that I had made the right choice.

<figure>
    <img src="/assets/images/http-server.png" alt="An image of a turtle strapped to a rocket, which has 'v8' on its side. Underneath it all is a word 'Node.js'" />
    <span class="image-caption">I just thought the image was hilarious and I couldn't resist showing it to you <br/>(taken from <a href="https://www.npmjs.com/package/http-server">https://www.npmjs.com/package/http-server</a>)</span>
</figure>

"Serving up static files like they were turtles strapped to rockets", said the image.

All I needed to setup my server was to run two simple commands:

`npm i http-server`

and then

`http-server .` 

executed from my website folder.

## Reason 1: http-server can't run on default ports
So I installed it and ran it only to discover that it can't listen to the ports 80 or 443 (default ports for HTTP and HTTPS respectively). Apparently, it's a common restriction for Linux systems - the lower port numbers require root privileges. I could bypass this by running `http-server` with `sudo`, but I felt icky about it. I mean, I'm no security expert but I suspect that it's probably not safe to run Node.js server with root privileges.

The simplest workaround for this that I could think of was to use NGINX as a reverse proxy that would redirect requests from port 80 or 443 to the one that I run my http-server on. It's possible because unlike http-server, NGINX isn't a subject to this limitation. So it seemed I was going to need NGINX after all. Now, if I was going to install NGINX anyway, the logical thing to do at that point was to abandon http-server and just use NGINX as a server directly. But I felt bad about removing http-server. I wanted to give it a chance, and besides, I wanted to experiment and try this proxying approach too, because it seemed cool, ha-ha.

Note: there are [other ways](https://stackoverflow.com/questions/413807/is-there-a-way-for-non-root-processes-to-bind-to-privileged-ports-on-linux) to solve this, but they all seem to require some familiarity with Linux.

## Reason 2: http-server can't gzip files
Another, and, perhaps, the biggest disappointment with http-server for me was that, as it turned out, it doesn't provide gziping capability. When I skimmed through the docs I saw a flag `--gzip` and I thought that it was what I needed. What this flag does, however, is it tells the http-server to serve gzipped version of an asset **if it will find it alongside the original uncompressed file**. So it is up to you to gzip the assets somehow. Of course, I didn't want to do this. I was ready to pull the plug on http-server because of this nuisance, had NGINX not solve this problem too. To my pleasant surprise, NGINX was gzipping everything that was going through it before sending it to the client. In the end, I didn't care who does the gzipping, so I decided to leave the http-server be.

## Reason 3: http-server doesn't restart after crash
There was one last thing I had to do to ensure that my setup was robust. in case if my http-server was to crash, there was no mechanism in place to restart it. And since we are comparing the two technologies, it's another point in favor of NGINX - it works as a service by default, so you don't have to do any additional steps to ensure it's always running. It will start after reboot automatically and it will be restarted if it fails. For http-server I had to do some additional work to achieve the same effect.
Following [this tutorial](https://rollout.io/blog/running-node-js-linux-systemd/) I created a *systemd* service that would take care of keeping the http-server alive. 

Now I was covered. Yes the setup was unnecessary complex and it was bugging me a little bit, but it worked.

Fast-forward to this weekend, when suddenly something broke on my server. Fortunately, Cloudflare CDN, which I use for this blog, has this neat "Always Online" feature that masks the original server failure by continuing to serve cached pages. Still, I had to go and see what was wrong on the server. And I thought that it was a good opportunity to start over with a clean slate and do everything right this time. So I removed http-server and simplified my NGINX config using [this guide](https://medium.com/@jasonrigden/how-to-host-a-static-website-with-nginx-8b2dd0c5b301). The whole process of configuring NGINX took about 15 minutes or so. I shouldn't have feared it from the start.

## Conclusion
If you are thinking about using http-server or, for that matter, any other Node.js package as a server for your static site, I would recommend using NGINX instead. It has everything a typical static site might need: it can gzip your files on the fly, it supports HTTP 2.0. Moreover, because it's very popular, tools like *certbot* are aware of it, which makes enabling HTTPS a breeze - *certbot* takes care of updating NGINX config for your site automatically. Yes, you have to configure it, but I think it's worth spending 15 minutes on it because once you do it, it's not going to need any more of your attention.

As for http-server, I don't want to come across as a hater. I'm not saying that it's a bad package. It's great for its simplicity, and I will continue to use it, but only as a development server. For production purposes, in my opinion, it lacks some key features such as gzipping. Also, it requires a few additional steps to be able to listen to "privileged" ports and to start on boot. 

