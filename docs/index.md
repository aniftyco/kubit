---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: Web framework for Node.js
hero:
  name: Kubit
  text: Web framework for Node.js
  tagline:
    TypeScript-first web framework with everything you need to build a full-stack application with an ecosystem of official
    packages and more.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/aniftyco/kubit
  image: /hero-icon.svg

features:
  - icon: 🌐
    title: Routing
    details:
      Kubit has a feature rich routing layer with support for route groups, subdomain based routing and resource routes.
  - icon: ⚙️
    title: Controllers
    details:
      Controllers are a first class citizen in Kubit, helping you remove the inline route handlers to dedicated
      controller classes.
  - icon: 📤
    title: File Uploads
    details: Along with the standard bodyparser, the support for managing file uploads is baked into the framework's core.
  - icon: 🔍
    title: Validator
    details: The schema based validator in Kubit provides you both the runtime validations and static type safety.
  - icon: 🛠️
    title: Template Engine
    details: Create traditional style server rendered web apps using the home grown template engine of Kubit.
  - icon: 🗃️
    title: Object-Relational Mapping (ORM)
    details: An SQL ORM built on top of Active Record pattern.
  - icon: 🔒
    title: Authentication
    details: Build login flows using API tokens or sessions.
  - icon: 🔑
    title: Authorization
    details: Build your own ACL using access actions and policies.
  - icon: 🗄️
    title: Drive
    details: Store user uploaded files in Amazon S3, Google Cloud Service or within the local file system.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
