---
date: 2020-07-12
pageTitle: Modal dialogs accessibility improvement and jQuery removal
syntaxHighlightEnabled: true
SEO_Description: In this post I describe how I got rid of jQuery dependency in my comment form. I also talk about Micromodal npm package — minimalistic acessible modal windows library.
---

${toc}

### The problem

As I've mentioned in the [previous post](/posts/eleventy-staticman/#staticman-for-comments), I brought over the code for my comments section from another website. Even though I was spared having to write everything from scratch myself, porting Jekyll templates to my eleventy blog turned out to be more time-consuming than I expected. So, by the time I was done with this work I was eager to finally deploy my blog and call it a night. I didn't have the energy to polish everything, even though there were a few things I didn't like in the code. The main issue was that the code was using jQuery. It's not a secret in 2020 that you most likely don't need jQuery. There's even a website whose purpose is solely to communicate this idea: [youmightneedjquery.com](http://youmightnotneedjquery.com/). But it's funny how it turned out to be especially true in my case, to the degree that it can be a textbook example of this principle.

The minified version of the jQuery that my template was referencing was 83 Kb.
It's a problem for two reasons:

1. Performance
2. Network traffic

JavaScript is the most expensive resource in the Web because it has to be parsed, compiled, and executed after it has been downloaded. Modern computers on broadband connection do all this in the blink of an eye; however, the processing time can be longer for low-end devices on poor mobile network. Not everybody surfes the web on a powerful desktop or the latest iPhone. While browser is busy loading and executing the script, it pauses parsing page HTML, which increases the time user has to wait for the page to load. As a temporary solution I've added `defer="true"` attribute to the script tag. It tells the browser that the script is not critical for initial page rendering and can be loaded and evaluated after the browser has finished parsing the page. With this small change, the performance problem was solved, and I could leave it like that if it wasn't for the second concern — traffic.

Downloading 83 Kb (it reality the size of transferred data is less than 83kb if it's gzipped) is not a problem for those on unlimited plans. But a lot of people still have some monthly limit on their Internet traffic on smartphones and this limit isn't even that high. And even if you don't have to worry how much data you download in your home country, it all changes the moment you go abroad and roaming kicks in. Usually your mobile network operator will switch you on some postpaid plan that charge you for every megabyte of traffic. That's why it's not a concern we can dismiss easily. If websites keep sending unnecessary scripts down the pipe these kilobytes add up quickly. Developers have to be mindful of what we are sending and make sure to send only what's necessary. It can save money!

In my script jQuery was used for a couple of things:

 - DOM elements selection and simple DOM manipulations in the part of the code responsible for showing modal window: 
 - Form serialization and ajax request

### Modal window rework
So this is the old implemenation in a nutshell:

``` js
    function showModal(title, message) {
      $('.js-modal-title').text(title);
      $('.js-modal-text').html(message);
      $('body').addClass('show-modal');
    }

    ...

    $('.js-close-modal').click(function () {
      $('body').removeClass('show-modal');
    });
```

All I had to do to make it work without jQuery was replace DOM element selections with standard Web API calls like `Element.querySelector()` or `Document.getElementById()` and use `Element.classList.add`/`Element.classList.remove`, and `Element.innerHTML` instead of their jQuery counterparts. 

As a side note, I should say that these jQuery methods are not entirely useless now. They are nice because they work in old versions of IE, unlike, for instance, `Element.classList.add`/`Element.classList.remove`. I decided for myself, however, that trying to support IE below 11 version is just too much pain for a hobby project, so there was no reason to keep using them.

It was easy enough to replace these calls, and I could stop there; however, I wasn't quite happy about my modal window implementation: it was very crude and not accessible. So I decided to use a little npm module called [
Micromodal](https://github.com/ghosh/micromodal) to make my modals awesome. The lib is tiny and very focused — it's only ~1.8kb minified and gzipped. Here's what my modal look like now. I mean, look at it, isn't it beautiful?

<figure>
  <picture>
    <source srcset="/assets/images/modal.png" media="(min-width: 800px)" />
    <source srcset="/assets/images/modal-small.png" media="(max-width: 800px)" />
    <img src="/assets/images/modal-small.png" alt="Screenshot of a modal window, using Micromodal module" /> 
  </picture>
  <span class="image-caption">New look of the modal window</span>  
</figure>

But aside from looking good, most importantly it's fully accessible: you can tab through the controls, and focus won't leave the modal. You can close the modal by pressing Esc, and it uses all the right WAI-ARIA attributes to assist screen readers.

### Ajax and form serialization

The last thing I had to do was to replace `$.ajax` with something. I had a few options here inlcuding new promised-based `fetch` API, which is supposed to replaces `XMLHttpRequest` in modern browsers. However it doesn't work even in IE 11, so I decided to use less fancy but more widely supported `XMLHttpRequest`. So, what looked before like this:

``` js
 $.ajax({
        ...
        data: $(this).serialize(),
        success: function (data) {
          showModal('Comment submitted', `Thanks! Your comment is 
            <a href="https://github.com/dKab/blog/pulls">pending</a>.
            It will appear when approved.`);
        }
    });
```

became essentially this:

``` js
xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 
      'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var status = xhr.status;
            if (status === 0 || (200 <= status && status < 400)) {
                MicroModal.show('modal-success');
            } else {
                ...
                MicroModal.show('modal-error');
            }
            ...
        }
    };

    xhr.send(serialize(form));
```

I've omitted some boring details for reader's convenience, but you get the gist. Yes, It's less elegant, but it's not super-comlicated and it does the job, which is good enough for me.

The only thing that made me miss jQuery was its `serialize()` method. Proper form serialization is not as easy to do in JavaScript as it should be, in my opinion. I wish there was an std library function for that. But alas, it doesn't exist. Although it wasn't hard to find the function that does it online. It's [not pretty](https://github.com/dKab/blog/blob/master/assets/main.js#L43), but it was a small price to pay, considering we managed to get rid of 83 Kb library.

Hope you enjoyed the post. See you later! 👋


