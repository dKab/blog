When it comes to page rendering there are few approaches. Let's look at each of them through the lens of page loading speed.

... 

This is called server-side rendering. There's also a client-side rendering. Very often it is used in SPA (Single Page Application) which means that the routing, as well as rendering, is performed on the client-side. It allows us to build very rich and highly responsive interfaces on the web (e.g. web-based spreadsheet) but it's not all unicorns and rainbows and this approach has it's own pros and cons: since rendering step is moved from server to the client it results in shorter *time to first byte* (because the server has less work to do now before it can respond), but longer *time to interactive* because the browser needs to parse, compile and execute the javascript first, which would, in turn, make requests to the server for data needed to render the page, and only after that the page is ready to receive user input. In recent years, a combined approach emerged — an advent of Node.js made it possible to use the same technology on frontend and backend which is what so-called universal apps rely on. Such apps use the same codebase to prerender the page on backend first and send it in a ready state, allowing to avoid showing some kind of spinner while the page is being rendered by the client javascript. This improves user experience significantly. After receiving the page, the client then re-renders it (inconspicuous for the user), to be able to "take it from here". These universal apps aren't perfect though, because the process of re-rendering of the whole page after it's been already shown to the user, which is called "rehydration" by the way, presents two issues: 
1. Data duplication. On the client we want to avoid sending requests for the same data that has been used by the backend to render the page, therefore this data is usually attached to the page by the backend in JSON format, so that client could parse it and use it right away. So, the same data is being transferred twice - in the form of rendered HTML and raw JSON data.
2. While client javascript re-renders the page in the background, the page is not responsive to user input. If a user clicks on a button, this will be ignored (there is a solution for that, where we buffer all user input during rehydration to replay it once the app is done bootstrapping)

So to sum it up, usually, to show a page we need to:

1. get data from some storage or API
2. render the page's HTML using this data
3. return the rendered HTML page

And in the case of universal apps there's also 4th step:

1. Rehydrate the UI (re-render the page in the browser)

Static web sites are very performant because they allow us to skip steps 1, 2, and, of course, 4 altogether! Well, not skip, but do it beforehand and not at the time of the request.