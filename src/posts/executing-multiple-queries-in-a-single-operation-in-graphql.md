---
title: 🚀 Executing multiple queries in a single operation in GraphQL
metaDesc: A new feature for the GraphQL API for WordPress
socialImage: /images/interactive-schema.png
date: '2021-08-08'
tags:
  - graphql
  - server
  - features
---

It's been only 15 days since releasing the [GraphQL API for WordPress](https://github.com/GraphQLAPI/graphql-api-for-wp), and I couldn't help myself, so this week I added yet a new feature: the server can now execute multiple queries in a single operation.

![Executing multiple queries in a single operation](/images/executing-multiple-queries.gif "Executing multiple queries in a single operation").

This is not query batching. When doing query batching, the GraphQL server executes multiple queries in a single request. But those queries are still independent from each other. They just happen to be executed one after the other, to avoid the latency from multiple requests.

In this case, all queries are combined together, and executed as a single operation. That means that they will reuse their data. For instance, if a first query fetches some data, and a second query also accesses the same data, this data is retrieved only once.

This feature is shipped together with the `@export` directive, which enables to have the results of a query injected as an input into another query. Check out [the query below](https://newapi.getpop.org/graphiql/?query=%23%20Run%20this%20query%20to%20execute%20all%20other%20queries%2C%20together%0Aquery%20__ALL%20%7B%20id%20%7D%0A%0A%23%20Export%20the%20user%27s%20name%0Aquery%20GetUserName%20%7B%0A%20%20user(id%3A1)%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_search%22)%0A%20%20%7D%0A%7D%0A%0A%23%20Search%20for%20posts%20with%20the%20user%27s%20name%20from%20the%20previous%20query%0Aquery%20SearchPosts(%24_search%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20posts(searchfor%3A%20%24_search)%20%7B%0A%20%20%20%20title%0A%20%20%7D%0A%7D&operationName=__ALL), hit "Run" and select query with name `"__ALL"`, and see how the user's name obtained in the first query is used to search for posts in the second query:

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

<div id="graphiql" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

(GraphiQL currently [does not allow](https://github.com/graphql/graphiql/issues/1635) to execute multiple operations. Hence, that `ALL` query is a hack I added, enabling GraphiQL to tell the GraphQL server to execute all queries.)

## Why is this even useful?

This functionality is currently not part of the GraphQL spec, but it has been requested:

- [[RFC] Executing multiple operations in a query](https://github.com/graphql/graphql-spec/issues/375)
- [[RFC] exporting variables between queries](https://github.com/graphql/graphql-spec/issues/377)

The beauty of this approach, is that many times we need to execute an operation against the GraphQL server, then wait for its response, and then use that result to perform another operation. By combining them together, we are saving this extra request.

You may think that saving a single roundtrip is not big deal. Maybe. But this is not limited to just 2 queries: it can contain as many operations as needed.

A use case is to use GraphQL queries to replicate executing a script. Including conditionals depending on the value of a previous state.

## GraphQL as (meta-)scripting

[GraphQL by PoP](https://graphql-by-pop.com), which is the GraphQL engine over which the GraphQL API for WordPress is based, is a few steps ahead in providing a language to manipulate how to trasverse the query graph, and operate on it.

For instance, it allows to send a newsletter to multiple users, fetching the content of the latest blog post and translating it to each person's language, all in a single operation!

You don't believe me? Check the query below, which is using the [PoP Query Language](https://graphql-by-pop.com/docs/extended/pql.html), a URL-based alternative to the GraphQL Query Language:

```less
/?
postId=1&
query=
  post($postId)@post.
    content|
    date(d/m/Y)@date,
  getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList|
  arrayUnique(
    extract(
      getSelfProp(%self%, userList),
      lang
    )
  )@userLangs|
  extract(
    getSelfProp(%self%, userList),
    email
  )@userEmails|
  arrayFill(
    getJSON(
      sprintf(
        "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
        [arrayJoin(
          getSelfProp(%self%, userEmails),
          "%26emails[]="
        )]
      )
    ),
    getSelfProp(%self%, userList),
    email
  )@userData;

  post($postId)@post<
    copyRelationalResults(
      [content, date],
      [postContent, postDate]
    )
  >;

  getSelfProp(%self%, postContent)@postContent<
    translate(
      from: en,
      to: arrayDiff([
        getSelfProp(%self%, userLangs),
        [en]
      ])
    ),
    renameProperty(postContent-en)
  >|
  getSelfProp(%self%, userData)@userPostData<
    forEach<
      applyFunction(
        function: arrayAddItem(
          array: [],
          value: ""
        ),
        addArguments: [
          key: postContent,
          array: %value%,
          value: getSelfProp(
            %self%,
            sprintf(
              postContent-%s,
              [extract(%value%, lang)]
            )
          )
        ]
      ),
      applyFunction(
        function: arrayAddItem(
          array: [],
          value: ""
        ),
        addArguments: [
          key: header,
          array: %value%,
          value: sprintf(
            string: "<p>Hi %s, we published this post on %s, enjoy!</p>",
            values: [
              extract(%value%, name),
              getSelfProp(%self%, postDate)
            ]
          )
        ]
      )
    >
  >;

  getSelfProp(%self%, userPostData)@translatedUserPostProps<
    forEach(
      if: not(
        equals(
          extract(%value%, lang),
          en
        )
      )
    )<
      advancePointerInArray(
        path: header,
        appendExpressions: [
          toLang: extract(%value%, lang)
        ]
      )<
        translate(
          from: en,
          to: %toLang%,
          oneLanguagePerField: true,
          override: true
        )
      >
    >
  >;

  getSelfProp(%self%,translatedUserPostProps)@emails<
    forEach<
      applyFunction(
        function: arrayAddItem(
          array: [],
          value: []
        ),
        addArguments: [
          key: content,
          array: %value%,
          value: concat([
            extract(%value%, header),
            extract(%value%, postContent)
          ])
        ]
      ),
      applyFunction(
        function: arrayAddItem(
          array: [],
          value: []
        ),
        addArguments: [
          key: to,
          array: %value%,
          value: extract(%value%, email)
        ]
      ),
      applyFunction(
        function: arrayAddItem(
          array: [],
          value: []
        ),
        addArguments: [
          key: subject,
          array: %value%,
          value: "PoP API example :)"
        ]
      ),
      sendByEmail
    >
  >
```

To run the query, there's no need for GraphiQL: it's execution is done via `GET`, so a simple link will do. Click here and marvel: [query to execute newsletter](https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData;post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E;getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E|getSelfProp(%self%,%20userData)@userPostData%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20postContent,array:%20%value%,value:%20getSelfProp(%self%,sprintf(postContent-%s,[extract(%value%,%20lang)]))]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20header,array:%20%value%,value:%20sprintf(string:%20%22%3Cp%3EHi%20%s,%20we%20published%20this%20post%20on%20%s,%20enjoy!%3C/p%3E%22,values:%20[extract(%value%,%20name),getSelfProp(%self%,%20postDate)])])%3E%3E;getSelfProp(%self%,%20userPostData)@translatedUserPostProps%3CforEach(if:%20not(equals(extract(%value%,%20lang),en)))%3CadvancePointerInArray(path:%20header,appendExpressions:%20[toLang:%20extract(%value%,%20lang)])%3Ctranslate(from:%20en,to:%20%toLang%,oneLanguagePerField:%20true,override:%20true)%3E%3E%3E;getSelfProp(%self%,translatedUserPostProps)@emails%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20content,array:%20%value%,value:%20concat([extract(%value%,%20header),extract(%value%,%20postContent)])]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20to,array:%20%value%,value:%20extract(%value%,%20email)]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20subject,array:%20%value%,value:%20%22PoP%20API%20example%20:)%22]),sendByEmail%3E%3E).

Want to understand what is going on here? Check out this [step-by-step description of how this query works](https://leoloso.com/posts/demonstrating-pop-api-graphql-on-steroids/).

## Eventually in GraphQL?

The query above works currently with PQL, which offers a couple of extra features that I have requested for the GraphQL spec:

- [Composable fields](https://github.com/graphql/graphql-spec/issues/682)
- [Composable directives](https://github.com/graphql/graphql-spec/issues/683)

I have been told that, most likely, these features won't be add to GraphQL. But I wonder if they could be replicated through directives.

Now that I have implemented the `@export` directive to link queries together, this is something I could explore.

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
        docExplorerOpen: true,
        response: responseText,
        query: '# Run this query to execute all other queries, together\nquery __ALL { id }\n\n# Export the user's name\nquery GetUserName {\n  user(id:1) {\n    name @export(as: "_search")\n  }\n}\n\n# Search for posts with the user's name from the previous query\nquery SearchPosts($_search: String = "") {\n  posts(searchfor: $_search) {\n    title\n  }\n}\n',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql'),
  );
</script>
