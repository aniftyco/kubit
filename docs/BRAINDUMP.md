# Brain Dump

JavaScript is the most widely used language. Everyone uses it for frontends because it's the only language that runs in the browser. To reduce context switching, JavaScript on the server is growing too. Still, the backend story often feels lacking, because many tools are optimized for client‑heavy apps that make a few API calls.

JavaScript meta‑frameworks like Next, Remix (v3), Nuxt, and SvelteKit focus primarily on client rendering with helpful, but limited, backend support.

Tools like TanStack are starting to push backend concerns forward, but they’re still fairly bare‑bones for a full MVC experience.

I come from a PHP background where frameworks like Symfony and Laravel provide everything needed to build full‑stack applications. Rails, Django, and Phoenix offer similar experiences in their ecosystems.

But these frameworks are primarily backend‑focused and can miss the modern frontend story. htmx, Livewire, Hotwire, and LiveView are great paradigms, but they’re not built around the most widely used frontend libraries, and often reinvent parts of the wheel.

We already have a great, proven frontend ecosystem. We need something that bridges backend and frontend in a cohesive way. JavaScript (or TypeScript) on the backend—with sufficient care—can be the sweet spot.

What I have here aims for the best of both worlds: a monolithic MVC framework in JavaScript—because MVC works great—paired with a modern frontend story.

You have background jobs, an ORM, database migrations, a CLI tool, mailables, controllers, view rendering—the expected building blocks.

Views are React components—not a custom template language. They receive props from the backend.

In the routes (see `skeleton/app/routes.ts:1`), the first argument to `view()` is the page key used to resolve the React component under `views/`. The renderer outputs the component with any layouts to a single HTML blob returned to the browser. Then an Inertia‑style protocol mounts onto that server HTML and the client takes over.

React is the view layer for everything. Mailables render in JSX too.

I believe a JavaScript backend like this—coupled with React and an Inertia‑style protocol to blur the frontend and backend—is a compelling way to build apps in 2026.

## Why Another Framework?

- Reduce context switching: one language end‑to‑end
- Use React for views without inventing a template DSL
- Favor conventions with clear extension points

## How It Fits Together (At a Glance)

- Routes map to inline handlers or controller methods
- Controllers can return `view()` or other responses and can set `response.status`
- Views are React components rendered on the server and hydrated on the client
- Models use decorators for columns, timestamps, and hooks; basic relations exist for shape
- Migrations use a familiar DSL; Jobs and Mail are stubs initially to prove the API
