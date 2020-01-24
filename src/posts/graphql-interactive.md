---
title: 👁 Visualize the GraphQL-powered WordPress schema!
metaDesc: The GraphQL Voyager makes you see the full picture
socialImage: https://leoloso.com/images/graphql-voyager.png
date: '2020-01-24'
tags:
  - pop
  - api
  - graphql
  - voyager
---

I just discovered an awesome new tool to visualize and interact with the application schema: [GraphQL Voyager](https://github.com/APIs-guru/graphql-voyager). It enables to have a bird eye's view of the schema, and zoom in into the different types, their properties, and the relationships with other types.

Of course I had to deploy it on my own server! So here is the [interactive schema for my GraphQL API demo site](https://newapi.getpop.org/graphql-interactive/). Doesn't it look gorgeous?

Since my [GraphQL server](https://github.com/getpop/graphql) is integrated to [WordPress](https://wordpress.org), it is very easy to visualize all the relationships from the WordPress database. 

(I'm still completing the different types, properties and relationships in my schema, so this visualization still does not mirror the whole WordPress data model... this will hopefully be finished in the upcoming weeks.)

This is how the interactive GraphQL looks like (even though a bit compressed here!):

<link
  crossorigin 
  rel="stylesheet" 
  href="https://cdn.jsdelivr.net/npm/graphql-voyager/dist/voyager.css" 
/>
<div id="voyager" style="height: 80vh; padding-top: 0; margin-top: 1rem; background: whitesmoke;" class="video-player">Loading...</div>
<script
  crossorigin 
  src="https://cdn.jsdelivr.net/npm/react@16/umd/react.production.min.js"
></script>
<script
  crossorigin 
  src="https://cdn.jsdelivr.net/npm/react-dom@16/umd/react-dom.production.
min.js"></script>
<script
  crossorigin 
  src="https://cdn.jsdelivr.net/npm/graphql-voyager/dist/voyager.min.js"
></script>
<script>
function introspectionProvider(query) {
  return fetch('https://newapi.getpop.org/api/graphql', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({query: query}),
  }).then(response => response.json());
}
GraphQLVoyager.init(document.getElementById('voyager'), {
  introspection: introspectionProvider
})
</script>

This is such a powerful and beautiful visualization of the data graph. Kudos to the contributors from this [great project](https://github.com/APIs-guru/graphql-voyager)!