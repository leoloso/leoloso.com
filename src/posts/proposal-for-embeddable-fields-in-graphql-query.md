---
title: 📢 Proposal for "Embeddable fields" in GraphQL
metaDesc: As an attached (non-mandatory) feature for the spec
socialImage: /images/graphql-logo.png
date: '2020-09-26'
tags:
  - graphql
  - spec
templateEngineOverride: md
---

I'd like to make a proposal for a new feature for GraphQL, not to be appended to the [official spec](https://spec.graphql.org/), but as an optional feature that GraphQL servers may decide to support (similar to the [GraphQL Cursor Connections spec](https://relay.dev/graphql/connections.htm)).

This post is part of the groundwork to find out if there is support for this feature within the GraphQL community. If there is, only then I'll submit it as a new issue to the [GraphQL spec repo](https://github.com/graphql/graphql-spec/) for a thorough discussion, and offer to become its champion.

> **Note:** This feature is already [supported by GraphQL by PoP](https://graphql-by-pop.com/docs/operational/embeddable-fields.html). Click on the "Run" button on the GraphiQL clients throughout this post, to execute the query and see the expected response.

---

## Proposed new feature: "Embeddable fields"

Embeddable fields is a syntax construct, that enables to resolve a field within an argument for another field from the same type, using the [mustache](https://en.wikipedia.org/wiki/Mustache_%28template_system%29) syntax `{{field}}`.

> **Note:** To make it convenient to use, field `echoStr(value: String): String` can be added to the schema, as in the examples shown throughout this post.

<a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20description%3A%20echoStr(value%3A%20%22Post%20%7B%7Btitle%7D%7D%20was%20published%20on%20%7B%7Bdate%7D%7D%22)%0A%20%20%7D%0A%7D" target="_blank">This query</a> contains embedded fields `{{title}}` and `{{date}}`:

<div id="graphiql-1st" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

The syntax can contain whitespaces around the field: ```{{ field }}```.

<a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20description%3A%20echoStr(value%3A%20%22Post%20%7B%7B%20title%20%7D%7D%20was%20published%20on%20%7B%7B%20date%20%7D%7D%22)%0A%20%20%7D%0A%7D" target="_blank">This query</a> contains embedded fields `{{ title }}` and `{{ date }}`:

<div id="graphiql-2nd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

The embedded field may or may not contain arguments:

- `{{ fieldName }}`
- `{{ fieldName(fieldArgs) }}`

<a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20description%3A%20echoStr(value%3A%20%22Post%20%7B%7B%20title%20%7D%7D%20was%20published%20on%20%7B%7B%20date(format%3A%20%5C%22d%2Fm%2FY%5C%22)%20%7D%7D%22)%0A%20%20%7D%0A%7D" target="_blank">This query</a> formats the date: `date(format: \"d/m/Y\")`:

<div id="graphiql-3rd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

> Note: The string quotes must be escaped: `\"`

Embedded fields also work within directive arguments.

<a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%09%20%20id%0A%20%20%20%20title%20%40skip(if%3A%20%22%7B%7B%20hasComments%20%7D%7D%22)%0A%20%20%7D%0A%7D" target="_blank">This query</a> resolves field `title` only if the same post has comments:

<div id="graphiql-4th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

> **Note:** Using embeddable fields together with directives `@skip` and `@include` is an interesting use case. However, condition `if` expects a `Boolean`, not a `String`; even though the query can be resolved properly in the server, there is type mismatch in the client.
>
> This proposal may suggest to accept embedded fields also on their own, and not only within a string, so they can be casted to their own type: `@skip(if: {{ hasComments }})`. More on this below.

<a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20title%3A%20echoStr(value%3A%20%22(%7B%7B%20commentCount%20%7D%7D)%20%7B%7B%20title%20%7D%7D%20-%20posted%20on%20%7B%7B%20date%20%7D%7D%22)%20%40include(if%3A%20%22%7B%7B%20hasComments%20%7D%7D%22)%0A%20%20%20%20title%20%40skip(if%3A%20%22%7B%7B%20hasComments%20%7D%7D%22)%0A%20%20%7D%0A%7D" target="_blank">This query</a> resolves field `title` in two different ways, depending on the post having comments or not:

<div id="graphiql-5th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

## Benefits of this new feature

Why would we want a GraphQL query to support embeddable fields? The following are benefits I've identified so far.

### It lessens the need for a client to process the response

In most situations, we have a client to request the data from the GraphQL server and transform it into the required format.

For instance, a website on the client-side can process the data with JavaScript, as to transform fields `title` and `date` into a description:

```js
const desc = `Post ${ response.data.title } was published on ${ response.data.date }`
```

However, in some situations we may need to retrieve the data for a service that we do not control, and which does not offer tools to process the results.

For instance, a newsletter service (such as Mailchimp) may accept to define an endpoint from which to retrieve the data for the newsletter. Whatever data is returned by the endpoint is final; it can't be manipulated before being injected into the newsletter.

In these situtations, the query could use embeddable fields to manipulate the response into the required format. This could be particularly useful when accessing [GraphQL over HTTP](https://github.com/graphql/graphql-over-http).

### It can help declutter the schema

The use case above could also be satisfied by adding an extra field `Post.descriptionForNewsletter` to the schema. But this solution clutters the schema, and embeddable fields could be considered a more elegant solution.

### It improves the development experience

Embeddable fields could be compared to [arrow functions](https://www.w3schools.com/Js/js_arrow_function.asp) in JavaScript, which is syntactic sugar over a feature already available in the language.

Arrow functions are not really needed, but they provide benefits:

- they shorten the amount of code needed to achieve something
- they simplify the syntax

As such, the feature becomes a welcome-to-have in the language, producing a better development experience.

### The `if` condition in `@skip` and `@include` can become dynamic

Currently, argument `"if"` for the `@skip` and `@include` directives can only be an actual boolean value (`true` or `false`) or a variable with the boolean value. This behavior is pretty static.

Embeddable fields would enable to make this behavior more dynamic, by evaluating the condition on some property from the object itself.

There is an issue to address: `if` is a `Boolean`, not a `String`, so to avoid type conflicts the GraphQL syntax may also need to accept the embedded field on its own, not wrapping it between string quotes:

```graphql
query {
  posts {
	  id
    title @skip(if: {{ hasComments }})
  }
}
```

Removing the need to wrap `{{ }}` between quotes `" "` would solve this issue for every scalar type other than `String`, not just `Boolean` (check the example below with `droid`, using embeddable fields to resolve an `ID`).

### It enables to code templates within the GraphQL query

Embeddable fields enable to embed a template within the GraphQL query itself, which would render the GraphQL service more configuration-friendly.

For instance, combined with the [flat chain syntax](https://github.com/graphql/graphql-spec/issues/174) and [nested mutations](https://github.com/graphql/graphql-spec/issues/252) (two other features also proposed for the spec), we could produce the following query, which sends an email to the user notifying that his/her comment was replied to:

```graphql
mutation {
  comment(id: 1) {
    replyToComment(data: data) {
      id @sendEmail(
        to: "{{ parentComment.author.email }}",
        subject: "{{ author.name }} has replied to your comment",
        content: "
          <p>On {{ comment.date(format: \"d/m/Y\") }}, {{ author.name }} says:</p>
          <blockquote>{{ comment.content }}</blockquote>
          <p>Read online: {{ comment.url }}</p>
        "
      )
    }
  }
}
```

### It could satisfy "exporting variables between queries"

Proposed feature [[RFC] exporting variables between queries](https://github.com/graphql/graphql-spec/issues/377) attempts to `@export` the value of a field, and inject it into another field in the same query:

```graphql
query A {
  hero {
    id @export(as: "droidId") 
  }
}

query B($droidId: String!) {
  droid (id: $droidId) {
    name
  }
}
```

With embeddable fields and the flat chain syntax, this use case could be satisfied like this:

```graphql
query {
  droid (id: {{ hero.id }} ) {
    name
  }
}
```

## Backwards compatibility

This feature **breaks backwards compatibility**. [From the spec](https://github.com/graphql/graphql-spec/blob/master/CONTRIBUTING.md#guiding-principles):

> Once a query is written, it should always mean the same thing and return the same shaped result. Future changes should not change the meaning of existing schema or queries or in any other way cause an existing compliant GraphQL service to become non-compliant for prior versions of the spec.

In our case, if a query currently has this shape:

```graphql
query {
  foo: echoStr(value: "Hello {{ world }}!")
}
```

...it expects the response to be:

```json
{
  "data": {
    "foo": "Hello {{ world }}!"
  }
}
```

With embeddable fields the query above will produce a different response and, moreover, it may even produce an error message, as when there is no field `Root.world`.

In addition, considering the case of not wrapping `{{ }}` between string quotes `" "`, as in the query below:

```graphql
query {
  posts {
	  id
    title @skip(if: {{ hasComments }})
  }
}
```

Currently, this query would produce a syntax error, being displayed in the GraphiQL client, and possibly not parsed by the server. This behavior would change.

Because of being backwards incompatible, it is suggested to make embeddable fields an **opt-in feature**, prompting users to be fully aware of the consequences before enabling it.

## Further research

Embeddable fields would affect some components from the GraphQL workflow. How should these be dealt with?

### GraphiQL integration

The [GraphiQL client](https://github.com/graphql/graphiql) shows an error message when a field does not exist, or if a field argument receives a value with a different type than declared in the schema, among other potential errors. Can this information be conveyed for embeddable fields too?

For this to happen, GraphiQL would need to parse the field argument inputs and identify all `{{ fieldName(fieldArgs) }}` instances, as to do the validations and show the error messages.

### Behavior when field is not found

What happens when an embedded field does not exist? For instance, if in the query below, field `{{ name }}` exists but `{{ surname }}` does not:

```graphql
{
  users {
    fullName: echoStr(value: "{{ name }} {{ surname }}")
  }
}
```

Should the response produce an error message, and skip processing the field? Eg:

```json
{
  "errors": [
    "Field 'surname' does not exist, so 'echoStr(value: \"{{ name }} {{ surname }}\")' cannot be resolved"
  ]
}
```

Or should the missing field be skipped but still resolve the field, and possibly show a warning? Eg:

```json
{
  "warnings": [
    "Field 'surname' does not exist"
  ],
  "data": {
    "users": [
      {
        "fullName": "Juan {{ surname }}"
      },
      {
        "fullName": "Pedro {{ surname }}"
      },
      {
        "fullName": "Manuel {{ surname }}"
      }
    ]
  }
}
```

Or should the failing field be removed altogether? (Notice there's still a space at the end of each resolved value):

```json
{
  "warnings": [
    "Field 'surname' does not exist"
  ],
  "data": {
    "users": [
      {
        "fullName": "Juan "
      },
      {
        "fullName": "Pedro "
      },
      {
        "fullName": "Manuel "
      }
    ]
  }
}
```

### Escaping `{{ field }}`

If we actually want to print the string `"{{ field }}"` in the response, without resolving it, how should it be done?

## Previous literature

This feature is a less ambitious version of [composable fields](https://github.com/graphql/graphql-spec/issues/682), differing in these aspects:

- It's not meant to be part of the GraphQL spec, but as an attached optional spec, and offered as an opt-in feature by the GraphQL server
- If resolved only within a string, embeddable fields would not require a change to the GraphQL syntax
- Having a field resolve the value for another field happens only 1 level down, not multiple-levels down as with composable fields

## Current implementations

Embeddable fields are supported in GraphQL server [GraphQL by PoP](https://graphql-by-pop.com), and its implementation for WordPress [GraphQL API for WordPress](https://github.com/GraphQLAPI/graphql-api-for-wp), in both as an opt-in feature.

## Join the discussion!

If there is enough support for this feature, I will add an RFC issue to the GraphQL spec. Everyone is welcome to [provide feedback in this Reddit post](https://www.reddit.com/r/graphql/comments/j043rw/proposal_for_embeddable_fields_in_graphql/):

- Do you support embeddable fields in GraphQL? Would you benefit from it? How?
- Are you against embeddable fields? Why?

<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />

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
  const responseText = "Click the \"Execute Query\" button";
  const endpointGraphQLFetcher = (endpoint, graphQLParams) =>
    fetch(endpoint, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    })
      .then(response => response.json())
      .catch(() => response.text());

  const apiURL = 'https://newapi.getpop.org/api/graphql/';
  const graphQLFetcher = graphQLParams => endpointGraphQLFetcher(apiURL, graphQLParams);

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: 'query {\n  posts {\n    description: echoStr(value: "Post {{title}} was published on {{date}}")\n  }\n}',
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
        response: responseText,
        query: 'query {\n  posts {\n    description: echoStr(value: "Post {{ title }} was published on {{ date }}")\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-2nd'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: 'query {\n  posts {\n    description: echoStr(value: "Post {{ title }} was published on {{ date(format: \\"d/m/Y\\") }}")\n  }\n}',
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
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: 'query {\n  posts {\n	id\n    title @skip(if: "{{ hasComments }}")\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-4th'),
  );

  ReactDOM.render(
    React.createElement(
      GraphiQL, 
      { 
        fetcher: graphQLFetcher,
        docExplorerOpen: false,
        response: responseText,
        query: 'query {\n  posts {\n    title: echoStr(value: "({{ commentCount }}) {{ title }} - posted on {{ date }}") @include(if: "{{ hasComments }}")\n    title @skip(if: "{{ hasComments }}")\n  }\n}',
        variables: null,
        defaultVariableEditorOpen: false
      }
    ),
    document.getElementById('graphiql-5th'),
  );
</script>