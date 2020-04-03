---
title: 🧩 Adding an @export directive to GraphQL by PoP
metaDesc: Peeking into the design process of a powerful directive
socialImage: /images/graphql-by-pop-logo.jpg
date: '2020-04-03'
tags:
  - pop
  - graphql
  - development
  - directives
---

Here comes my latest new custom directive implemented for [GraphQL by PoP](https://graphql-by-pop.com): the [`@export` directive](https://github.com/getpop/graphql/blob/109d194c11dd2510d0ea5ce42b88fb556397400c/src/DirectiveResolvers/ExportDirectiveResolver.php), to export the value of a field (or set of fields) into a variable, to be used somewhere else in the query.

The need for this directive is documented in [this issue](https://github.com/graphql/graphql-spec/issues/583) from the GraphQL spec. The biggest use case is to enable to combine 2 queries into 1, avoiding the second query to wait for the 1st one to be executed, improving the performance.

This directive is not part of the official GraphQL spec, though, because it's not easy to support in some circumstances. In particular, [`graphql-js`](https://github.com/graphql/graphql-js), the reference implementation of GraphQL in JavaScript, resolves fields in parallel through promises, so it doesn't know in advance which field will be resolved before which other field; this is a problem for `@export`, since the field exporting the value must be executed before the field reading the value.

This is not a problem for GraphQL for PoP, though, since it is possible to control the order in which fields will be executed, in the query itself (it's a hacky method though, but it works). So then I wondered, why not implementing it? It took me one afternoon of coding, but here it is. And it works like a charm! Let's check it out.

## What the @export directive does

Let's suppose we want to search all posts which mention the name of the logged-in user. Normally, we would need 2 queries to accomplish this: we first retrieve the user's name:

```graphql
query GetLoggedInUserName() {
  me {
    name
  }
}
```

...and then, having executed this query and retrieved this data, we pass it through a variable to perform the search in a second query:

```graphql
query GetPostsContainingString($search: String = "") {
  posts(search: $search) {
    id
    title
  }
}
```

The @export directive allows to export the value from a field, and inject this value into a second field through a variable with name defined under argument `as`, allowing to combine the 2 queries into 1:

```graphql
query GetPostsContainingLoggedInUserName($search: String = "") {
  me {
    name @export(as: "search")
  }
  posts(search: $search) {
    id
    title
  }
}
```

## Handling different cases

The query above exports a single value: the user's name. Fields returning lists can also be exported. For instance, in this query, the exported value is the list of names from the logged-in user's friends (hence the type of the `$search` variable went from `String` to `[String]`):

```graphql
query GetPostsContainingLoggedInUserName($search: [String] = []) {
  me {
    friends {
      name @export(as: "search")
    }
  }
  posts(searchAny: $search) {
    id
    title
  }
}
```

> In the [GitHub issue](https://github.com/graphql/graphql-spec/issues/583) there are propositions of naming the argument as `"as"` for single values, and `"into"` for lists, however I preferred to name everything using the same argument name, sticking to `"as"`.

In addition, we could also export several properties from a same object into the same variable. For that, instead of exporting a single field, we can use dictionaries to export several fields. Then, replicating the previous 2 cases into dictionaries, we have these 2 new cases:

1. Exporting a dictionary of field values: when `@export` is applied to several fields on the same single object
2. Exporting an array of a dictionary of field values: when `@export` is applied to several fields on a list of objects

For the first case, the query could export both the `name` and `surname` fields from the user, and have a `searchByAnyProperty` input that receives a dictionary:

```graphql
query GetPostsContainingLoggedInUserName($search: Map = {}) {
  me {
    name @export(as: "search")
    surname @export(as: "search")
  }
  posts(searchByAnyProperty: $search) {
    id
    title
  }
}
```

The second case is similar but applied to the list of the logged-in user's friends, so the `@export` will produce a list of dictionaries:

```graphql
query GetPostsContainingLoggedInUserName($search: [Map] = []) {
  me {
    friends {
      name @export(as: "search")
      surname @export(as: "search")
    }
  }
  posts(searchAnyByAnyProperty: $search) {
    id
    title
  }
}
```

## Let's see it in action

I have implemented the 4 cases, let's play with them. I have replaced the field `me` with `user(id: 1)`, since otherwise non logged-in users cannot run it.

This is the [first query](https://newapi.getpop.org/graphiql/?query=query%20GetPostsAuthorNames(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20user(id%3A%201)%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20posts(searchfor%3A%20%24_authorName)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPostsAuthorNames): it extracts the user's name into variable `$_authorName`, and then performs a search of all posts containing this string. Click on Run to see the results:

<div id="graphiql-1st" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

I also combined all 4 cases them into a [single query](https://newapi.getpop.org/graphiql/?query=query%20GetSomeData(%24_firstPostTitle%3A%20String%20%3D%20%22%22%2C%20%24_postTitles%3A%20%5BString%5D%20%3D%20%5B%5D%2C%20%24_firstPostData%3A%20Mixed%20%3D%20%7B%7D%2C%20%24_postData%3A%20%5BMixed%5D%20%3D%20%5B%5D)%20%7B%0A%20%20post(id%3A1)%20%7B%0A%20%20%20%20title%20%40export(as%22%3A%22_firstPostTitle%22)%0A%20%20%20%20title%20%40export(as%22%3A%22_firstPostData%22)%0A%20%20%20%20url%20%40export(as%22%3A%22_firstPostData%22)%0A%20%20%20%20date%20%40export(as%22%3A%22_firstPostData%22)%0A%20%20%7D%0A%20%20posts(limit%3A5)%20%7B%0A%20%20%20%20title%20%40export(as%22%3A%22_postTitles%22)%0A%20%20%20%20title%20%40export(as%22%3A%22_postData%22)%0A%20%20%20%20url%20%40export(as%22%3A%22_postData%22)%0A%20%20%20%20date%20%40export(as%22%3A%22_postData%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20exportedVariables%0A%20%20%20%20_firstPostTitle%3A%20echoVar(variable%3A%20%24_firstPostTitle)%0A%20%20%20%20_postTitles%3A%20echoVar(variable%3A%20%24_postTitles)%0A%20%20%20%20_firstPostData%3A%20echoVar(variable%3A%20%24_firstPostData)%0A%20%20%20%20_postData%3A%20echoVar(variable%3A%20%24_postData)%0A%20%20%7D%0A%7D&operationName=GetSomeData), in this way:

Case 1 - `@export` a single value:

```graphql
post(id:1) {
  title @export(as: "_firstPostTitle")
}
```

Case 2 - `@export` a list of values:

```graphql
posts(limit:5) {
  title @export(as: "_postTitles")
}
```

Case 3 - `@export` a dictionary of field/value:

```graphql
post(id:1) {
  title @export(as: "_firstPostData")
  url @export(as: "_firstPostData")
  date @export(as: "_firstPostData")
}
```

Case 4 - `@export` an array of dictionaries of field/value:

```graphql
posts(limit:5) {
  title @export(as: "_postData")
  url @export(as: "_postData")
  date @export(as: "_postData")
}
```

To visualize the value stored in the dynamic variables, I created fields `exportedVariables`, which returns the list of all the dynamic variables created in the query, and `echoVar`, which echoes back the value of a single one. Since I do not know in advance the type of the values, these fields deal with a generic `Mixed` type; there will be a mismatch in the GraphiQL client (that's why there's a red line over the argument definitions), but the query can be executed without any problem. Check it out by pressing the Run button:

<div id="graphiql-2nd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

## Gotchas for my implementation

Nothing is perfect: in order for `@export` to work, there are 3 considerations that need to be satisfied in the query:

1. The name of the variable must start with "_"
2. The fields must be executed in order
3. The variable must always receive a default value

I'll explain why these are mandatory and how they work, one by one.

### 1. The name of the variable must start with "_"

As mention earlier on, the `@export` directive is not part of the GraphQL spec, so there are no considerations on the language itself for its implementation. Then, the GraphQL server implementers must find their own way to satisfy their requirements, but without deviating from the GraphQL syntax, expecting that the solution could one day become part of the spec.

For [my implementation](https://github.com/getpop/graphql/blob/109d194c11dd2510d0ea5ce42b88fb556397400c/src/DirectiveResolvers/ExportDirectiveResolver.php), I decided that `@export` will export the value into a normal variable, accessible as `$variable`. Please notice that this is a design decision which may vary across implementers; for instance, [Apollo's `@export` directive](https://www.apollographql.com/docs/link/links/rest/#export-directive) is accessed under entry `exportVariables` (as doing `{exportVariables.id}`), not under entry `args` as its inputs. Then, while Apollo doesn't require to declare the exported variables in the operation name, my implementation does.

The issue with this solution is that static (i.e. "normal") variables and dynamic variables behave differently: while the value for a static variable can be determined when parsing the query, the value for a dynamic variable must be determined on runtime, right when reading the value fo the variable. Then, the GraphQL engine must be able to tell which way to treat a variable, if the static or the dynamic way.

Given the constraints, and in order to avoid introducing new, unsupported syntax into the query (such as having `$staticVariables` and `%dynamicVariables%`), the solution I found is to have the dynamic variable name start with `"_"`: `$_dynamicVariable`.

### 2. The fields must be executed in order

The `@export` directive would not work if reading the variable takes place before exporting the value into the variable. Hence, the engine needs to provide a way to control the field execution order. This is the issue that `graphql-js` cannot solve easily, making this feature not be officially supported by GraphQL.

Luckily for this case, GraphQL by PoP, being coded in PHP, doesn't use promises or resolve fields in parallel; it resolves them sequentially, using a deterministic order which the developer can manipulate in the query itself. Let's see how it works.

> Note: I have described the engine's algorithm for loading data in detail in [this article](https://blog.logrocket.com/designing-graphql-server-optimal-performance/) (which explains how the dataloading engine avoids the N+1 problem by architectural design) and [this article](https://blog.logrocket.com/simplifying-the-graphql-data-model/) (which recounts how resolvers can be made as simple to implement as possible).

The engine loads data in iterations for each type, first resolving all fields from the first type it encounters in the query, then resolving all fields from the second type it encounters in the query, and so on until there are no more types to process:

![Dealing with types in iterations](/images/dataloading-engine-type-iterations.png "Dealing with types in iterations")

If after processed, a type is referenced again in the query to retrieve non-loaded data (eg: from additional objects, or additional fields), then the type is added again at the end of the iteration list (in this case, the `Director` type):

![Repeated types in iterations](/images/dataloading-engine-repeated-type-iterations.png "Repeated types in iterations")

Let's see how this plays out for our query. For our first attempt, we create the [basic query](https://newapi.getpop.org/graphiql/?query=query%20GetPostsAuthorNames(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20user(id%3A%201)%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%20%20posts(searchfor%3A%20%24_authorName)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%7D%0A%7D&operationName=GetPostsAuthorNames). When pressing the Run button:

<div id="graphiql-3rd" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

...the response displays an error:

```json
{
  "errors": [
    {
      "message": "Expression '_authorName' is undefined",
      "extensions": {
        "type": "query"
      }
    }
  ],
  //...
}
```

What this means is that variable `$_authorName` was read before being set. Let's see why this happens.

The types that appear in the query are:

```graphql
query GetPostsAuthorNames($_authorName: String = "") { # Type: Root
  user(id: 1) { # Type: User
    name @export(as: "_authorName") # Type: String
  }
  posts(searchfor: $_authorName) { # Type: Post
    id # Type: ID
    title # Type: String
  }
}
```

To process the types and load their data, the dataloading engine adds the query type (`Root`) into a FIFO (First-In, First-Out) list (becoming `[Root]`), and iterates over the types:

1. Pop the first type of the list, `Root` (list becomes: `[]`)
2. Process all fields queried from the `Root` type, `user` and `posts`, and add their types to the list, `User` and `Post` respectively (list becomes: `[User, Post]`)
3. Pop the first type of the list, `User` (list becomes: `[Post]`)
4. Process the field queried from the `User` type, `name`. Because it is a scalar type (`String`), there is no need to add it to the list
5. Pop the first type of the list, `Post` (list becomes: `[]`)
6. Process all fields queried from the `Post` type, `id` and `title`. Because these are scalar types (`ID` and `String`), there is no need to add them to the list
7. List is `[]`, iteration ends.

Here we can see the problem: `@export` is executed on line `4` (when resolving field `name` on type `User`), but it was read on line `2` (when resolving field `posts(searchfor: $_authorName)` on type `Root`).

To address this issue, we must "delay" reading the exported variable. This can be done through field `self` from type `Root` which, as its name indicates, returns once again the root object. You may wonder: "I already have the root object... why do I need to retrieve it again?". Because `self` if applied on type `Root`, and it returns once again an object of type `Root`, then this type will be added once again to the end of the FIFO list! This (hacky) way allows to effectively control in what order are fields executed.

Let's put it into practice, placing field `posts(searchfor: $_authorName)` inside a `self` field, like in [this query](https://newapi.getpop.org/graphiql/?query=query%20GetPostsAuthorNames(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20user(id%3A%201)%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20posts(searchfor%3A%20%24_authorName)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPostsAuthorNames). Press on the Run button to see if now works:

<div id="graphiql-4th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

Let's explore the order in which types are resolved for this new query:

1. Pop the first type of the list, `Root` (list becomes: `[]`)
2. Process all fields queried from the `Root` type, `user` and `self`, and add their types to the list, `User` and `Root` respectively (list becomes: `[User, Root]`)
3. Pop the first type of the list, `User` (list becomes: `[Root]`)
4. Process the field queried from the `User` type, `name`. Because it is a scalar type (`String`), there is no need to add it to the list
5. Pop the first type of the list, `Root` (list becomes: `[]`)
6. Process the field queried from the `Root` type, `posts`, and add its type to the list, `Post` (list becomes: `[Post]`)
7. Pop the first type of the list, `Post` (list becomes: `[]`)
8. Process all fields queried from the `Post` type, `id` and `title`. Because these are scalar types (`ID` and `String`), there is no need to add them to the list
9. List is `[]`, iteration ends.

Now, we can see that the problem has been resolved: `@export` is executed on line `4` (when resolving field `name` on type `User`), and it is read on line `6` (when resolving field `posts(searchfor: $_authorName)` on type `Root`). 🥳

### 3. The variable must always receive a default value

The GraphQL parser still treats a dynamic variable as a variable, hence it validates that its value has been defined, or it throws an error "The variable has not been set".

To avoid this error (which halts execution of the query), we must always define a default value for that argument, even if this value won't be used.

## Bonus: making @skip/include a bit more dynamic

I believe that, in some areas, GraphQL currently falls short from its true potential. That is the case concerning `@skip/include` directives:

```graphql
query {
  post(id:1) {
    id
    title
    excerpt @include(if: $showExcerpt)
  }
}
```

These directives receive the condition to evaluate through argument `"if"`, which can only be the actual boolean value (`true` or `false`) or a variable with the boolean value (`$showExcerpt`). This is pretty static.

What about executing the condition based on some property from the object itself? For instance, we may want to show the `excerpt` based on the object having comments or not. Now this is doable! Run [this query](https://newapi.getpop.org/graphiql/?query=query%20ShowExcerptIfPostHasComments(%24id%3A%20ID!%2C%20%24_hasComments%3A%20Boolean%20%3D%20false)%20%7B%0A%20%20post(id%3A%20%24id)%20%7B%0A%20%20%20%20hasComments%20%40export(as%3A%20%22_hasComments%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20post(id%3A%20%24id)%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20excerpt%20%40include(if%3A%20%24_hasComments)%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=ShowExcerptIfPostHasComments&variables=%7B%0A%20%20%22id%22%3A%201%0A%7D) changing variable `"id"` from `1499` to `1` to see it working:

<div id="graphiql-5th" style="height: 65vh; padding-top: 0; margin-top: 1rem;" class="video-player"></div>

This works whenever the exported variable concerns a single value, but not for lists, because the `if` condition is evaluated for all objects in the list in the same iteration, so they will override each other before their result is used to perform the validation on some later iteration.

## Tadaaaa

It has been a really fulfilling week of creating custom directives for [GraphQL by PoP](https://graphql-by-pop.com). With very little effort, I could create several useful and powerful directives, some of which have been requested for the GraphQL spec:

- [@removeIfNull](https://leoloso.com/posts/remove-if-null-directive/) ([issue](https://github.com/graphql/graphql-spec/issues/476))
- [@cache](https://leoloso.com/posts/cache-and-logtime-directives/)
- [@traceExecutionTime](https://leoloso.com/posts/cache-and-logtime-directives/)
- `@export` ([issue](https://github.com/graphql/graphql-spec/issues/583))

I don't think I'm exaggerating if I say that GraphQL by PoP is one of the most powerful GraphQL servers out there, for either PHP or others. It is still not easy to install, and its documentation is all over the place. But I'm working on a new documentation website to put everything in order, and make it easy for the community to install it, use it and become involved.

It will take me a few weeks though... in the meantime, if you want to find out more about GraphQL by PoP, give me a shout through [email](mailto:leo@getpop.org) or [Twitter](https://twitter.com/twitter).

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
        query: 'query GetPostsAuthorNames($_authorName: String = "") {\n  user(id: 1) {\n    name @export(as: "_authorName")\n  }\n  self {\n    posts(searchfor: $_authorName) {\n      id\n      title\n    }\n  }\n}'
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
        query: 'query GetSomeData($_firstPostTitle: String = "", $_postTitles: [String] = [], $_firstPostData: Mixed = {}, $_postData: [Mixed] = []) {\n  post(id:1) {\n    title @export(as: "_firstPostTitle")\n    title @export(as: "_firstPostData")\n    url @export(as: "_firstPostData")\n    date @export(as: "_firstPostData")\n  }\n  posts(limit:5) {\n    title @export(as: "_postTitles")\n    title @export(as: "_postData")\n    url @export(as: "_postData")\n    date @export(as: "_postData")\n  }\n  self {\n    exportedVariables\n    _firstPostTitle: echoVar(variable: $_firstPostTitle)\n    _postTitles: echoVar(variable: $_postTitles)\n    _firstPostData: echoVar(variable: $_firstPostData)\n    _postData: echoVar(variable: $_postData)\n  }\n}'
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
        query: 'query GetPostsAuthorNames($_authorName: String = "") {\n  user(id: 1) {\n    name @export(as: "_authorName")\n  }\n  posts(searchfor: $_authorName) {\n    id\n    title\n  }\n}'
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
        query: 'query GetPostsAuthorNames($_authorName: String = "") {\n  user(id: 1) {\n    name @export(as: "_authorName")\n  }\n  self {\n    posts(searchfor: $_authorName) {\n      id\n      title\n    }\n  }\n}'
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
        query: 'query ShowExcerptIfPostHasComments($id: ID!, $_hasComments: Boolean = false) {\n  post(id: $id) {\n    hasComments @export(as: "_hasComments")\n  }\n  self {\n    post(id: $id) {\n      title\n      excerpt @include(if: $_hasComments)\n    }\n  }\n}',
        variables: '{\n  "id": 1499\n}',
        defaultVariableEditorOpen: true
      }
    ),
    document.getElementById('graphiql-5th'),
  );
</script>
