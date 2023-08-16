---
title: 🎉 Released GraphQL API v0.7, with support for mutations, and nested mutations!
metaDesc: A new standard feature, and a novel one
socialImage: /images/mutant-ninja-turtles.jpg
date: '2021-01-22'
canonicalUrl: https://gatographql.com/blog/released-graphql-api-v07-with-mutations-and-nested-mutations/
tags:
  - graphql
  - api
  - wordpress
  - plugin
  - release
---

**Note:** This blog post [has been crossposted](https://gatographql.com/blog/released-graphql-api-v07-with-mutations-and-nested-mutations/) from [gatographql.com](https://gatographql.com) (the GraphQL API for WordPress plugin's new site).

I released version 0.7 of the [GraphQL API for WordPress](https://gatographql.com), supporting mutations, and nested mutations! 🎉

![Mutations are awesome!](/images/finally-got-mutations.jpg)

Here is a tour showing the new additions.

## 1. Mutations! 🚀

[GraphQL mutations](https://graphql.org/learn/queries/#mutations) enable to modify data (i.e. perform side-effect) through the query.

Mutations was the big item still missing from the GraphQL API. Now that it's been added, I can claim that this GraphQL server is pretty much feature-complete (only subscriptions are missing, and I'm already [thinking on how to add them](https://github.com/GatoGraphQL/GatoGraphQL/issues/194)).

![Mutation root in the interactive schema](/images/graphql-schema-mutation-root.jpg "Mutation root in the interactive schema")

Let's check an example on adding a comment. But first, we need to execute another mutation to log you in, so you can add comments. Press the "Run" button on the GraphiQL client below, to execute mutation field `loginUser` with a pre-created testing user:  

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

<div id="graphiql-1st" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

[<a href="https://newapi.getpop.org/graphiql/?query=mutation%20LogUserIn%20%7B%0A%20%20loginUser(%0A%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%20%20%20%20password%3A%22pass%22%0A%20%20)%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%7D%0A%7D&operationName=LogUserIn" target="_blank">🔗 Open GraphiQL client in new window</a>]

Now, let's add some comments. Press the Run button below, to add a comment to some post by executing mutation field `addCommentToCustomPost` (you can also edit the comment text):

<div id="graphiql-2nd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

[<a href="https://newapi.getpop.org/graphiql/?query=mutation%20AddCommentToPost%20%7B%0A%20%20addCommentToCustomPost(%0A%20%20%20%20customPostID%3A%201459%2C%0A%20%20%20%20comment%3A%20%22Adding%20a%20comment:%20bla%20bla%20bla%22%0A%20%20)%20%7B%0A%20%20%20%20id%0A%20%20%20%20content%0A%20%20%20%20date%0A%20%20%7D%0A%7D&operationName=AddCommentToPost" target="_blank">🔗 Open GraphiQL client in new window</a>]

---

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

They have been [requested for the GraphQL spec](https://github.com/graphql/graphql-spec/issues/252) but not yet approved (and may never will), hence GraphQL API adds support for them as an opt-in feature, via the [Nested Mutations](https://github.com/GatoGraphQL/GatoGraphQL/tree/master/layers/GatoGraphQLForWP/plugins/gatographql/docs/en/modules/nested-mutations.md) module.

Then, the plugin supports the 2 behaviors:

1. The standard GraphQL behavior (i.e. adding mutation fields to the root type), by default
2. Nested mutations, as an opt-in

For instance, the query from above can also be executed with the following query, in which we first retrieve the post via `Root.post`, and only then add a comment to it via `Post.addComment`:

<div id="graphiql-3rd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

[<a href="https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=mutation%20AddComment%20%7B%0A%20%20post(id%3A%201459)%20%7B%0A%20%20addComment(%0A%20%20%20%20comment%3A%20%22Notice%20how%20field%20%60addCommentToCustomPost%60%20under%20the%20%60Root%60%20type%20is%20renamed%20as%20%60addComment%60%20under%20the%20%60Post%60%20type%3F%20The%20schema%20got%20neater!%22%0A%20%20)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20date%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=AddComment" target="_blank">🔗 Open GraphiQL client in new window</a>]

Mutations can also modify data on the result from another mutation. In the query below, we first obtain the post through `Root.post`, then execute mutation `Post.addComment` on it and obtain the created comment object, and finally execute mutation `Comment.reply` on it:

<div id="graphiql-4th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

[<a href="https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=mutation%20AddCommentAndResponse%20%7B%0A%20%20post(id%3A1459)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20addComment(comment%3A%22Isn%27t%20this%20awesome%3F%22)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20date%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20reply(comment%3A%22I%20think%20so!%22)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=AddCommentAndResponse" target="_blank">🔗 Open GraphiQL client in new window</a>]

This is certainly useful! 😍 (The alternative method to produce this same behavior, in a single query, is via the `@export` directive... I'll compare both of them in an upcoming blog post).

---

In this first release, the plugin ships with the following mutations:

✅ `CustomPost.update`<br/>
✅ `CustomPost.setFeaturedImage`<br/>
✅ `CustomPost.removeFeaturedImage`<br/>
✅ `CustomPost.addComment`<br/>
✅ `Comment.reply`

### Standard or nested? Or both?

You may have a GraphQL API that is used by your own application, and is also publicly available for your clients. You may want to enable nested mutations but only for your own application, not for your clients because this is a non-standard feature.

Good news: you can.

I've added a "Mutation Scheme" section in the Schema Configuration, which is used to customize the schema for [Custom Endpoints](https://github.com/GatoGraphQL/GatoGraphQL/tree/master/layers/GatoGraphQLForWP/plugins/gatographql/docs/en/modules/custom-endpoints.md) and [Persisted Queries](https://github.com/GatoGraphQL/GatoGraphQL/tree/master/layers/GatoGraphQLForWP/plugins/gatographql/docs/en/modules/persisted-queries.md):

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

1. [Standard behavior](https://newapi.getpop.org/graphql-interactive/):<br/>it uses types `QueryRoot` to handle queries and `MutationRoot` to handle queries
2. [Nested mutations keeping mutation fields duplicate](https://newapi.getpop.org/graphql-interactive/?mutation_scheme=nested):<br/>a single `Root` type handles queries and mutations, and redundant mutation fields in this type are kept
3. [Nested mutations removing redundant mutation fields from the root type](https://newapi.getpop.org/graphql-interactive/?mutation_scheme=lean_nested):<br/>same as above, but removing all redundant mutation fields from the `Root` type

✱ Btw1, these 3 schemas all use the same endpoint, but changing a URL param `?mutation_scheme` to values `standard`, `nested` and `lean_nested`. That's possible because the GraphQL server follows the [code-first approach](https://graphql-by-pop.com/docs/architecture/code-first.html). 🤟

✱ Btw2, these options can be selected on the "Mutation Scheme" section in the Schema configuration (shown above), hence you can also decide what behavior to apply for individual custom endpoints and persisted queries. 👏

---

Check out the [GraphQL API for WordPress](https://github.com/GatoGraphQL/GatoGraphQL/tree/master/layers/GatoGraphQLForWP/plugins/gatographql), and download it from [here](https://github.com/GatoGraphQL/GatoGraphQL/releases/latest/download/gatographql.zip).

Now it's time to start preparing for v0.8! 

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
<script src="/js/graphql-endpoints.js" type="application/javascript"></script>

<script type="application/javascript">
  const graphQLFetcher = graphQLParams =>
    fetch(getGraphQLEndpointURL(graphQLParams), getGraphQLOptions(graphQLParams, 'include'))
      .then(response => response.json())
      .catch(() => response.text());

  ReactDOM.render(
    React.createElement(
      GraphiQL,
      {
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: GRAPHQL_RESPONSE_TEXT,
        query: 'mutation LogUserIn {\n  loginUser(\n    usernameOrEmail:"test",\n    password:"pass"\n  ) {\n    id\n    name\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-1st'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL,
      {
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: GRAPHQL_RESPONSE_TEXT,
        query: 'mutation AddComment {\n  addCommentToCustomPost(\n    customPostID: 1459,\n    comment: "Adding a comment: bla bla bla"\n  ) {\n    id\n    content\n    date\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-2nd'),
  );

  const graphQLFetcher2 = graphQLParams =>
    fetch(getGraphQLEndpointURL(graphQLParams, 'mutation_scheme=nested'), getGraphQLOptions(graphQLParams, 'include'))
      .then(response => response.json())
      .catch(() => response.text());

  ReactDOM.render(
    React.createElement(
      GraphiQL,
      {
        fetcher: graphQLFetcher2,
        docExplorerOpen: true,
        response: GRAPHQL_RESPONSE_TEXT,
        query: 'mutation AddComment {\n  post(id: 1459) {\n  addComment(\n    comment: "Notice how field `addCommentToCustomPost` under the `Root` type is renamed as `addComment` under the `Post` type? The schema got neater!"\n  ) {\n      id\n      content\n      date\n    }\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-3rd'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL,
      {
        fetcher: graphQLFetcher2,
        docExplorerOpen: true,
        response: GRAPHQL_RESPONSE_TEXT,
        query: 'mutation AddCommentAndResponse {\n  post(id:1459) {\n    id\n    title\n    addComment(comment:"Isn\'t this awesome?") {\n      id\n      date\n      content\n      reply(comment:"I think so!") {\n        id\n        date\n        content\n      }\n    }\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-4th'),
  );
</script>
