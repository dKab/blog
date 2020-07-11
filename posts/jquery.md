---
date: 2020-07-11
pageTitle: Modal dialogs accessibility improvement and jQuery removal
syntaxHighlightEnabled: true
SEO_Description: 
---

It's not a secret in 2020 that you most likely don't need jQuery. There's even a website whose purpose is solely to communicate this idea: [youmightneedjquery.com](http://youmightnotneedjquery.com/). But it's funny how it turned out to be especially true in my case, to the degree that it can be a textbook example of this principle.

As I've mentioned in the [previous post](/posts/eleventy-staticman/#staticman-for-comments), I brought over the code for my comments section from another website. Even though I was spared having to write everything from scratch myself, porting Jekyll templates to my eleventy blog turned out to be more time-consuming than I expected. So, by the time I was done with this work I was eager to finally deploy my blog and call it a night. I didn't have the energy to polish everything, even though there were a few things I didn't like in the code. The main issue was that the code relied on jQuery for modal dialogs. "That's not necessary", I thought to myself the moment I saw it. The minified version of the library that the template was referencing was 83 Kb. It's a problem for two reasons:

1. Performance
2. Network traffic

First, let's talk about performance.
JavaScript is the most expensive resource that a typical website loads. That's because it has to be parsed, compiled, and executed after it has been downloaded. While these steps are happening browser pauses parsing page HTML, which increases the time user has to wait for the page to be displayed in the browser. Sure, 83 Kilobytes of JavaScript is not too much and modern hardware can process it rather quickly; however, the time spent on it can be longer for low-end devices. We have to remember that not everybody browses the web from a powerful desktop or the latest iPhone. And then, of course, the network quality has to be considered as well. In areas with bad coverage or on slow connections, even 83 Kb can make a difference.

To mitigate this issue for the time being I've added `defer="true"` attribute to the script tag. It tells the browser that the script is not critical for initial page rendering and can be loaded and evaluated after the browser has finished parsing the page. With this small change, the performance problem was solved, and I could leave it like that if it wasn't for the second concern — traffic.

Downloading 83 Kb is not a problem for people on unlimited plans. But a lot of people still have some monthly limit on their Internet traffic on smartphones and this limit not even that high. Moreover, I'm sure there are still postpaid plans that charge you for every megabyte of traffic. If websites keep sending unnecessary scripts down the pipe these kilobytes add up quickly. Therefore developers have to be mindful of what we are sending and make sure to send only what's necessary. It can save money!

When I ported the code I didn't look into it too hard, and I thought that apart from sending ajax request, jQuery was used to show modal dialogs and move the comment form around when a user clicks "reply" button. However, after closer examination, I found that the "reply" button reaction wasn't using jQuery. It was still crappy-looking code but without any jQuery references. Then I noticed that jQuery wasn't critical to modal dialogs either — it was involved in modal dialog functionality only for its addClass/removeClass utility methods and DOM element selections: 

``` js
    function showModal(title, message) {
      $('.js-modal-title').text(title);
      $('.js-modal-text').html(message);
      $('body').addClass('show-modal');
    }

    ...

    $.ajax({
        ...
        data: $(this).serialize(),
        success: function (data) {
          showModal('Comment submitted', `Thanks! Your comment is 
            <a href="https://github.com/dKab/blog/pulls">pending</a>.
            It will appear when approved.`);
        }
    });

    ...

     $('.js-close-modal').click(function () {
      $('body').removeClass('show-modal');
    });
```

So, contrary to my initial assumption, there wasn't any magical `.modal()` jQuery method, which would be hard to replace.
It meant that all I had to do was just replace DOM element selections with standard Web API calls like `Element.querySelector()` or `Document.getElementById()` and the modal would continue to work without jQuery. But because the modal dialog implementation was very crude, and not accessible I decided to use a little npm module called [
Micromodal](https://github.com/ghosh/micromodal) to make my modals awesome. The lib is tiny and very focused - it's only ~1.8kb minified and gzipped. So I ended up using it. I mean, look at this, isn't it beautiful? 

<figure>
  <picture>
    <source srcset="/assets/images/modal.png" media="(min-width: 800px)" />
    <source srcset="/assets/images/modal-small.png" media="(max-width: 800px)" />
    <img src="/assets/images/modal-small.png" alt="Screenshot of a modal window, using Micromodal module" /> 
  </picture>
  <span class="image-caption">New look of the modal window</span>  
</figure>

But aside from looking good, most importantly it's fully accessible: you can tab through the controls, and focus won't leave the modal. You can close the modal by pressing Esc, and it uses all the right WAI-ARIA attributes to assist screen-readers.

The last thing I had to do was to replace `$.ajax` with something. I didn't want to use `fetch` API because at that time I was still harboring some hope of supporting older IE and didn't want to deal with polyfills, so I decided to use plain old `XmlHttpRequest`. Later I realized that I could have as well used `fetch` since my idea to support old versions of IE was nothing more than a foolish dream because I rely heavily on flexbox in my CSS for my layout. So, this is what sending a POST ajax request looks like in my code now. It's not the most elegant code, but it does the job, and it's good enough for me.

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
                var unknownError = '¯\_(ツ)_/¯';
                var errorMessage;
                try {
                  var response = JSON.parse(xhr.response);
                  errorMessage = response.message || response.errorCode
                   || unknownError;
                } catch (e) {
                  errorMessage = unknownError;
                }
                document.getElementById('comment-error-code')
                  .innerHTML = errorMessage;
                MicroModal.show('modal-error');
            }
            form.classList.remove('disabled');
            form.reset();
            button.removeAttribute('disabled');
            button.innerHTML = 'Submit';
            grecaptcha.reset();
        }
    };

    xhr.send(serialize(form));
    event.preventDefault();

```

The only thing that made me miss jQuery was its `serialize()` method. Proper form serialization is not as easy to do in JavaScript as it should be, in my opinion. I wish there was an std library function for that. But alas, it doesn't exist. Therefore I had to search for and include this [huge ugly 60-line function](https://github.com/dKab/blog/blob/master/assets/main.js#L43) that does exactly that. But it's a small price to pay, considering we managed to get rid of 83 Kb library.

Hope you enjoyed the post. See you later! 👋


