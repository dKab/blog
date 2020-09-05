
In today's post I wanted to talk about different approaches to UI rendering and maybe clear some confusion around the term SSR (server-side rendering). I'll explain client-side rendering, server-side rendering and static sites, and we will see how each of the 3 compare to each other in terms of performance. 

### "Classic" Server-side 
Back in the day, all sites were either static or used server-side rendering. In the case of the server-side rendering, the server used to render each page, while the client's job was to just passively show the HTML that it got from the backend. We will see that this is often not what people mean when they say SSR nowadays.

### Single page applications and client-side rendering

As javascript evolved and became more and more useful, a lot of cool and sophisticated frameworks appeared, which allowed developers to shift more logic to the client. Thus Single Page Applications or SPAs were born. 
In SPA, routing, as well as (almost always) rendering, is performed on the client. It allows us to build rich and highly responsive interfaces on the web (e.g. web-based spreadsheet) eliminating the flashes between pages of the application, making navigation much more seamless - almost instant. Since the rendering step is moved from server to the client it results in shorter *time to first byte* (because now the server has less work to do before it can respond), but longer *time to interactive* because the browser needs to parse, compile and execute the javascript first, which would, in turn, make requests to the server for the data needed to render the page, and only after that the page is ready to receive user input. 

### "Modern" SSR and Universal applications
Because of the huge rise in popularity of javascript frameworks and UI libraries such as Angular and Reactjs, a lot of sites are (often needlessly) built as SPAs.
Because of that, more often than not the term SSR is used in the SPA context implicitly. And what is usually meant by SSR in this context is in reality a sort of combined approach. What I mean by "combined" is that rendering happens on the server as well as on the client. More precisely, the first page that is requested is rendered by the server, but then the client takes over and handles all further rendering. Node.js made it possible to use the same technology (Javascript) on frontend and backend, which is what so-called universal apps rely on. Such apps use the same codebase to prerender the page on the backend first and send it in a ready state, allowing to avoid showing some kind of spinner while the page is being rendered by the client javascript. This improves user experience significantly. After receiving the page, the client then re-renders it (inconspicuous for the user), to be able to "take it from here". All of this is done in an attempt to speed up the initial page loading.

But this approach is not without its drawbacks. The process of re-rendering of the whole page after it's been already shown to the user, which is called "rehydration", presents us with two new issues: 
1. Data duplication. On the client we want to avoid sending requests for the same data that has been used by the backend to render the page, therefore this data is usually attached to the page by the backend in JSON format, so that client could parse it and use it right away. So, the same data is being transferred twice - in the form of rendered HTML and raw JSON data.
2. While client javascript re-renders the page in the background, the page is not responsive to user input. If a user clicks on a button, this will be ignored (there is a solution for that, where we buffer all user input during rehydration to replay it once the app is done bootstrapping)

So to sum it up, usually, to show a page we need to:

1. get data from some storage or API
2. render the page's HTML using this data
3. return the rendered HTML page

And in the case of universal apps there's also 4th step:

1. Rehydrate the UI (re-render the page in the browser)

Static web sites are very performant because they allow us to skip steps 1, 2, and, of course, 4 altogether! Well, not skip, but do it beforehand and not at the time of the request. So if you want your sites to be blazing fast, go for static sites whenever it is possible.