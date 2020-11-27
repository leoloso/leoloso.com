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

For instance, <a href="https://newapi.getpop.org/graphiql/?query=mutation%20LogUserIn%20%7B%0A%20%20loginUser(%0A%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%20%20%20%20password%3A%22pass%22%0A%20%20)%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%7D%0A%7D%0Amutation%20AddCommentToPost%20%7B%0A%20%20addCommentToCustomPost(%0A%20%20%20%20customPostID%3A%201459%2C%0A%20%20%20%20comment%3A%20%22Finally!%22%0A%20%20)%20%7B%0A%20%20%20%20id%0A%20%20%20%20content%0A%20%20%20%20date%0A%20%20%7D%0A%7D&operationName=LogUserIn" target="_blank">this query</a> adds a comment to some post. To see it working, press the "Run" button on the GraphiQL client below (which is actually executeing 2 mutations: it logs the user in first, and then adds the comment):

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

<div id="graphiql-first" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

In this first release, the plugin ships the following mutations:

- `createPost`
- `updatePost`
- `setFeaturedImageforCustomPost`
- `removeFeaturedImageforCustomPost`
- `addCommentToCustomPost`
- `replyComment`
- `loginUser`
- `logoutUser`

## 2. Nested Mutations! 🚀

Mutations can also be nested, modifying data on the result from another mutation.

In <a href="https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=%23mutation%20%7B%0A%23%20%20loginUser(%0A%23%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%23%20%20%20%20password%3A%22pass%22%0A%23%20%20)%20%7B%0A%23%20%20%20%20id%0A%23%20%20%20%20name%0A%23%20%20%7D%0A%23%7D%0Amutation%20%7B%0A%20%20post(id%3A%201459)%20%7B%0A%20%20%20%20title%0A%20%20%20%20addComment(comment%3A%20%22Nice%20tango!%22)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20reply(comment%3A%20%22Can%20you%20dance%20like%20that%3F%22)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" target="_blank">this query</a>, we obtain the post entity through `Root.post`, then execute mutation `Post.addComment` on it and obtain the created comment object, and finally execute mutation `Comment.reply` on this latter object:

```graphql
mutation {
  post(id: 1459) {
    title
    addComment(comment: "Nice tango!") {
      id
      content
      reply(comment: "Can you dance like that?") {
        id
        content
      }
    }
  }
}
```

```graphql
mutation {
  updatePost(id: 5, title: "New title") {
    title
  }
}
```


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

  // const graphQLFetcher2 = graphQLParams =>
  //   fetch(apiURL+'/?use_namespace=1', {
  //     method: 'post',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(graphQLParams),
  //   })
  //     .then(response => response.json())
  //     .catch(() => response.text());

  // ReactDOM.render(
  //   React.createElement(
  //     GraphiQL,
  //     {
  //       fetcher: graphQLFetcher2,
  //       docExplorerOpen: true,
  //       response: responseText,
  //       query: "query {\n  posts {\n    url\n    title\n    excerpt\n    date\n    tags {\n      name\n      url\n    }\n    comments {\n      content\n      date\n      author {\n        name\n      }\n    }\n  }\n}",
  //       variables: null,
  //       defaultVariableEditorOpen: false
  //     }
  //   ),
  //   document.getElementById('graphiql-second'),
  // );
</script>
