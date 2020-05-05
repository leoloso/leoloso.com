---
title: 🎦 Video - Creating custom endpoints with the GraphQL API for WordPress plugin
metaDesc: To be released this May!
socialImage: /images/video-thumb-graphql-api-for-wp-endpoints.jpg
date: '2020-05-05'
tags:
  - graphql
  - api
  - wordpress
---

The upcoming GraphQL API for WordPress plugin (to be released this May!) allows to create multiple GraphQL endpoints, each of them with a different configuration, as to expose only the require data, add a corresponding access control strategy, set-up specific cache max-age values, and others.

For instance, we can create endpoints:

- `/graphql/website`
- `/graphql/mobile-app`
- `/graphql/client-this-one`
- `/graphql/client-that-one`

Each endpoint is attached its own GraphiQL (under `/?view=graphiql`) to execute queries, and Voyager (under `?view=schema`) to visualize the endpoint's schema (each endpoint can be configured to access only a sub-schema, i.e. certain parts from the grand schema).

Demo in this video (without audio!):

<iframe src="https://player.vimeo.com/video/413503485" width="640" height="400" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>