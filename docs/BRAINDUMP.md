# Brain Dump

So JavaScript is the most popular and widely used language, everyone uses it for their frontends because it's the only language that can run on that side. To keep from context switching JavaScript on the server has been proliferating, but I feel that we're lacking heavily on a good backend story for JavaScript because most of the people in that world are heavily skewed towards frontend and most of their work is client side heavy where they maybe need to fetch a few things and make some API calls.

JavaScript meta frameworks like Next, Remix (v3), Nuxt, SvelteKit, etc all focus heavily on the rendering of the client side stuff with a little help on the backend.

Sure things like Tanstack are starting to make splashes with more of the backend stuff, but they're still very bare bones.

I come from a PHP background where we have things like Symfony and Laravel, things that provide everything we need to build a full stack application in anything. Rails, Django, even Phoenix for Elixir offer similar stuff.

But these frameworks suffer from one common thing: They are primarily backend focused and really miss out on the frontend aspect. Sure they all have some really good frontend stories for things too, htmx is an awesome paradigm, so is Livewire, Hotwire and LiveView. But they're not using the biggest frontend libraries and often reinvent the wheel for everything...

We already have a proven great ecosystem when it comes to the frontend. We just need Something that bridges both of these together in a cohesive way and I truly think JavaScript (Or TypeScript) on the backend with enough love and care can be the holy grail of web dev.

What I have here is what I think is the best of both worlds. A completely JavaScript monolithic MVC framework, because MVC just fucking works great, that couples a modern frontend story.

You have background jobs, an ORM, database migrations, cli tool, mailables, controllers, view rendering and all that good stuff.

But the views are not their own custom template language, they're React components. Special JavaScript components that get their props from the backend.

When you have a route that looks like this:

```ts
router.get("greet", () => view("greet", { name: "Josh" }));
```

That `greet` key in the `view()` function tells the view renderer to use the `greet` view, which is located in `./app/views/greet.tsx`. The prop passed to that React component is the props you pass into the view render function (in this case `{ name: 'Josh' }`). The view render then renders that component and the wrapping layouts, everything necessary to produce a single html blob to return back to the browser. Then we utilize Inertia like protocol to mount onto that html returned by the server and client side stuff takes over.

React is the view layer for everything. All your mailable templates are rendered in JSX too.

I truly think a JavaScript backend like this coupled with React and an Inertia like protocol to blur the frontend and backend is the ultimate way to build an app in JavaScript in 2026.

