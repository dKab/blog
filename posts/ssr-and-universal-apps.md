---
date: 2020-09-06
pageTitle: Server-side Rendering In Modern Web Applications
syntaxHighlightEnabled: true
SEO_Description: This post describes how server-side rendering works in modern web-applications. What is a universal application? What is client-side rendering? The pros and cons of SSR and how it compares to static sites in terms of performance. Drawbacks of Universal applications.
---

${toc}

## "Classic" Server-side rendering
Back in the day, all sites were either static or used server-side rendering (SSR). In the case of SSR, the server used to render each page, while the client's job was to just passively show the HTML that it got from the backend.

## Client-side rendering in Single Page Applications 

As javascript evolved and grew more useful, a lot of powerful frameworks appeared, which allowed developers to shift more logic to the client. Thus Single Page Applications or SPAs were born. 
In a typical SPA, routing, as well as rendering, is performed on the client. This allows us to build rich and highly responsive interfaces on the web (e.g. web-based spreadsheet). With client-side rendering, the rendering step is moved from the server to the client. It results in shorter *time to first byte* (because now the server has less work to do before it can respond), but longer *time to interactive* because the browser needs to parse, compile and execute the javascript first, which would, in turn, make requests to the server for the data needed to render the page. And only after that, the page is ready to receive user input.

## "Modern" SSR and Universal applications

Because of the popularity of javascript frameworks and UI libraries such as Angular and Reactjs, a lot of sites are (often needlessly) built as SPAs nowadays. Because of that, more often than not the term SSR is used in the SPA context. But as described above SPAs use client-side rendering (or at least it used to be a default for a long time). So what does it mean when we say that server-side rendering is used in a Single Page Application? What is usually meant by SSR in this case, is in reality a sort of combined approach. What I mean by "combined" is that rendering happens on the server as well as on the client. More precisely, the first page that is requested is rendered by the server, but then the client takes over and handles all further rendering. Node.js made it possible to use the same technology (Javascript) both on frontend and backend, which is what so-called universal apps rely on. Such apps use the same codebase to prerender the page on the backend first and send it in a ready state, allowing to avoid showing some kind of spinner while the page is being rendered by javascript on the client, as we often do with client-side rendering. After receiving the page, the client then re-renders it (inconspicuous for the user), to be able to "take it from here". You might ask, why go to the trouble to do all of this? Well, for one, SSR is good for SEO (Search Engine Optimization). Also, it improves user experience by speeding up the initial page loading.

## Disadvantages of Universal apps

But this approach is not without its drawbacks. The process of re-rendering of the whole page after it's been already shown to the user, which is called "rehydration", presents us with two new issues: 
1. Data duplication. On the client we want to avoid sending requests for the same data that has been used by the backend to render the page, therefore this data is usually attached to the page by the backend in JSON format, so that client could parse it and use it right away. So, the same data is being transferred twice - in the form of rendered HTML and raw JSON data.
2. While client javascript re-renders the page in the background, the page is not responsive to user input. If a user clicks on a button, this will be ignored (there is a solution for that, where we buffer all user input during rehydration to replay it once the app is done bootstrapping)

## Conclusion

So to sum it up, usually, to show a page we need to:

1. get data from some storage or API
2. render the page's HTML using this data
3. return the rendered HTML page

And in the case of universal apps there's also 4th step:

4. Rehydrate the UI (re-render the page in the browser)

Static web sites are very performant because they allow us to skip steps 1, 2, and, of course, 4 altogether! Well, not skip, but do it beforehand and not at the time of the request. So if you want your sites to be blazing fast, go for static sites whenever it is possible.