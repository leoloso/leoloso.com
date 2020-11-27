---
title: 🎉 Released GraphQL API v0.7, with support for mutations, and nested mutations!
metaDesc: A new standard feature, and a novel one
socialImage: /images/mutant-ninja-turtles.jpg
date: '2021-12-03'
tags:
  - graphql
  - api
  - wordpress
  - plugin
  - release
---

I just released version 0.7 of the [GraphQL API for WordPress](https://github.com/GraphQLAPI/graphql-api-for-wp)! 🎉

![Awesome!](/images/awesome.jpg)

Here is a tour showing the new additions.

## 1. Mutations! 🚀

[GraphQL mutations](https://graphql.org/learn/queries/#mutations) enable to modify data (i.e. perform side-effect) through the query.

Mutations was the big item still missing from the GraphQL API. Now that it's been added, I can claim that this GraphQL server is pretty much feature-complete (only subscriptions are missing, and I'm already [thinking on how to add them](https://github.com/GraphQLAPI/graphql-api-for-wp/issues/61)).

![Mutation root in the interactive schema](/images/graphql-schema-mutation-root.jpg "Mutation root in the interactive schema")

For instance, <a href="https://newapi.getpop.org/graphiql/?query=mutation%20LogUserIn%20%7B%0A%20%20loginUser(%0A%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%20%20%20%20password%3A%22pass%22%0A%20%20)%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%7D%0A%7D%0Amutation%20AddCommentToPost%20%7B%0A%20%20addCommentToCustomPost(%0A%20%20%20%20customPostID%3A%201459%2C%0A%20%20%20%20comment%3A%20%22Finally!%22%0A%20%20)%20%7B%0A%20%20%20%20id%0A%20%20%20%20content%0A%20%20%20%20date%0A%20%20%7D%0A%7D&operationName=LogUserIn" target="_blank">this query</a> adds a comment to some post by executing mutation field `addCommentToCustomPost`. To see it working, press the "Run" button on the GraphiQL client below. This query is actually executing 2 mutations: it logs the user in first, and then adds the comment (because the demo site doesn't enable cross-site cookies, I'm adding the log-in to all queries below):

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

<div id="graphiql-first" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

In this first release, the plugin ships with the following mutations:

✅ `createPost`<br/>
✅ `updatePost`<br/>
✅ `setFeaturedImageforCustomPost`<br/>
✅ `removeFeaturedImageforCustomPost`<br/>
✅ `addCommentToCustomPost`<br/>
✅ `replyComment`<br/>
✅ `loginUser`<br/>
✅ `logoutUser`

## 2. Nested Mutations! 🚀🚀

Nested mutations is the ability to perform mutations on a type other than the root type in GraphQL.

They have been [requested for the GraphQL spec](https://github.com/graphql/graphql-spec/issues/252) but not yet approved (and may never will), hence GraphQL API adds support for them as an opt-in feature, via the [Nested Mutations](https://github.com/GraphQLAPI/graphql-api-for-wp/blob/master/docs/en/modules/nested-mutations.md) module.

Then, the plugin supports the 2 behaviors:

1. The standard GraphQL behavior (i.e. adding mutation fields to the root type), by default
2. Nested mutations, as an opt-in

For instance, the query from above can also be executed through <a href="https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=%23%20mutation%20LogUserIn%20%7B%0A%23%20%20%20loginUser(%0A%23%20%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%23%20%20%20%20%20password%3A%22pass%22%0A%23%20%20%20)%20%7B%0A%23%20%20%20%20%20id%0A%23%20%20%20%20%20name%0A%23%20%20%20%7D%0A%23%20%7D%0Amutation%20AddComment%20%7B%20%0A%20%20post(id%3A%201459)%20%7B%0A%20%20%20%20addComment(comment%3A%20%22Finally%20nested!%22)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20date%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=AddComment" target="_blank">this query</a>, in which we first retrieve the post via `Root.post`, and only then add a comment to it via `Post.addComment`:

<div id="graphiql-second" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

Mutations can also modify data on the result from another mutation, like in <a href="https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=%23%20mutation%20LogUserIn%20%7B%0A%23%20%20%20loginUser(%0A%23%20%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%23%20%20%20%20%20password%3A%22pass%22%0A%23%20%20%20)%20%7B%0A%23%20%20%20%20%20id%0A%23%20%20%20%20%20name%0A%23%20%20%20%7D%0A%23%20%7D%0Amutation%20AddCommentAndResponse%20%7B%0A%20%20post(id%3A1459)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20addComment(comment%3A%22Isn%27t%20this%20awesome%3F%22)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20date%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20reply(comment%3A%22I%20think%20so!%22)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=AddCommentAndResponse" target="_blank">this query</a>, in which we first obtain the post through `Root.post`, then execute mutation `Post.addComment` on it and obtain the created comment object, and finally execute mutation `Comment.reply` on it:

<div id="graphiql-third" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

This is soooo sweet!!! 😍

In this first release, the plugin ships with the following mutations:

✅ `CustomPost.update`<br/>
✅ `CustomPost.setFeaturedImage`<br/>
✅ `CustomPost.removeFeaturedImage`<br/>
✅ `CustomPost.addComment`<br/>
✅ `Comment.reply`

### Standard or nested? Or both?

You may have a GraphQL API that is used by your own application, and is also publicly available for your clients. You may want to enable nested mutations but only for your own application, not for your clients because this is a non-standard feature.

Good news: you can.

I've added a "Mutation Scheme" section in the Schema Configuration, which is used to customize the schema for [Custom Endpoints](https://github.com/GraphQLAPI/graphql-api-for-wp/blob/master/docs/en/modules/custom-endpoints.md) and [Persisted Queries](https://github.com/GraphQLAPI/graphql-api-for-wp/blob/master/docs/en/modules/persisted-queries.md):

![Mutation scheme in the Schema configuration](/images/schema-configuration-mutation-scheme.jpg)

Hence, you can disable the nested mutations everywhere, but enable them just for a specific custom endpoint that only your application will use. 💪

### Removing redundant fields from the root type

With nested mutations, mutation fields may be added two times to the schema:

- once under the root type
- once under the specific type

For instance, these fields can be considered a "duplicate" of each other:

- `Root.updatePost`
- `Post.update`

The GraphQL API enables to keep both of them, or remove the ones from the root type, which are redundant.

Check-out the following 3 schemas:

- [Standard behavior](https://newapi.getpop.org/graphql-interactive/)
- [Nested mutations keeping mutation fields duplicate](https://newapi.getpop.org/graphql-interactive/?mutation_scheme=nested)
- [Nested mutations removing redundant mutation fields from the root type](https://newapi.getpop.org/graphql-interactive/?mutation_scheme=lean_nested)

Btw, these are the options from the "Mutation Scheme" section in the Schema configuration, hence you can decide what behavior to apply for individual custom endpoints and persisted queries. 👏

<p><span style="font-size: 150px;">🙏</span></p>

<script
  crossorigin
  src="https://unpkg.com/react/umd/react.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/graphiql/graphiql.min.js"
></script>

<script>
  const apiURL = 'https://newapi.getpop.org/api/graphql/';
  const responseText = "Click the \"Execute Query\" button";
  const graphQLFetcher = graphQLParams =>
    fetch(apiURL, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    })
      .then(response => response.json())
      .catch(() => response.text());

  ReactDOM.render(
    React.createElement(
      GraphiQL,
      {
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: 'mutation LogUserInAndAddComment {\n  loginUser(\n    usernameOrEmail:"test",\n    password:"pass"\n  ) {\n    id\n    name\n  }\n\n  addCommentToCustomPost(\n    customPostID: 1459,\n    comment: "Finally!"\n  ) {\n    id\n    content\n    date\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-first'),
  );

  const graphQLFetcher2 = graphQLParams =>
    fetch(apiURL+'/?mutation_scheme=nested', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    })
      .then(response => response.json())
      .catch(() => response.text());

  ReactDOM.render(
    React.createElement(
      GraphiQL,
      {
        fetcher: graphQLFetcher2,
        docExplorerOpen: true,
        response: responseText,
        query: 'mutation LogUserInAndAddComment {\n  loginUser(\n    usernameOrEmail:"test",\n    password:"pass"\n  ) {\n    id\n    name\n  }\n  \n  post(id: 1459) {\n    addComment(comment: "Finally nested!") {\n      id\n      content\n      date\n    }\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-second'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL,
      {
        fetcher: graphQLFetcher2,
        docExplorerOpen: true,
        response: responseText,
        query: 'mutation {\n  loginUser(\n    usernameOrEmail:"test",\n    password:"pass"\n  ) {\n    id\n    name\n  }\n\n  post(id:1459) {\n    id\n    title\n    addComment(comment:"Isn\'t this awesome?") {\n      id\n      date\n      content\n      reply(comment:"I think so!") {\n        id\n        date\n        content\n      }\n    }\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-third'),
  );
</script>
