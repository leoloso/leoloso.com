---
title: 🔑 Justifying "Embeddable Fields" for GraphQL
metaDesc: This is my response to a comment asking why GraphQL needs this feature
socialImage: /images/graphql-logo.png
date: '2020-09-27'
tags:
  - graphql
  - spec
templateEngineOverride: md
---

This post is my response to [this comment on Reddit](https://www.reddit.com/r/graphql/comments/j043rw/proposal_for_embeddable_fields_in_graphql/g6pvqcj) concerning my [proposal to add embeddable fields to GraphQL](https://leoloso.com/posts/proposal-for-embeddable-fields-in-graphql-query/).

---

> If we want to make GraphQL good at transforming data, we need much more than string interpolation.

I don't have a clear answer about this. If we allow `String` interpolation, should we do the same for `Int`s, such as allowing additions or substractions?

I'd say no, but then why not? If we do allow it, something like this could be possible:

```graphql
query {
  service @include(if: {{ totalCredits }} - {{ usedCredits }} > 0) {
    id
  }
}
```

<!-- For comparison, VuePress also uses the `{{ var }}` syntax, and [writing `{{ 1 + 1 }}` is resolved as `2`](https://vuepress.vuejs.org/guide/using-vue.html#templating). -->

I do not support this use case as shown here, I certainly don't like it. The question is why then we do allow for `String` interpolation? Because it enables templating, which could be considered a legitimate use case:

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

> Programming languages are good at transforming data. Why not use application logic?

Indeed, my initial proposed features for the spec, [composable fields](https://github.com/graphql/graphql-spec/issues/682) and [composable directives](https://github.com/graphql/graphql-spec/issues/683), add meta-scripting capabilities to GraphQL.

How could that be benefitial? Say that you have a `@translate` directive that is applied on a `String`, as in [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%20%22en%22%2C%20to%3A%20%22es%22)%0A%20%20%7D%0A%7D):

```graphql
query {
  posts {
    id
    title @translate(from: "en", to: "es")
  }
}
```

Now, what happens if a field returns `[String]`, i.e. a list of `String`s? Then you can't use `@translate` anymore, you'd need to create another directive `@translateArrays`. And if there is only one entry from the array you need to translate, and not all of them? Then you need to add an optional argument `$keys: [String]` to specify which keys to translate. And if the keys are not strings, but are numeric? Or if instead of an array, you get an array of arrays? And so on, and on, and on.

Working with only fields to fetch data, the schema might eventually become unwieldy.

Now, if we have capabilities to compose or manipulate fields, then there is no need to pollute the schema with ad-hoc fields to satisfy each custom combination.

For [GraphQL by PoP](https://graphql-by-pop.com) (a GraphQL server that I've designed from scratch), I have accomplished this through a syntax called [PQL](https://graphql-by-pop.com/docs/extended/pql.html), which is a superset from the GraphQL query, supporting [composable fields](https://graphql-by-pop.com/docs/extended/pql-language-features.html#composable-fields) and [composable directives](https://graphql-by-pop.com/docs/extended/pql-language-features.html#composable-directives).

Let's see how all combinations can be satisfied just composing elements:

- Translating posts as strings:<br/><a href="https://newapi.getpop.org/api/graphql/?query=posts.title%3Ctranslate(from:en,to:es)%3E" target="_blank">`posts.title<translate(from:en,to:es)>`</a>
- Translating a list of strings:<br/><a href="https://newapi.getpop.org/api/graphql/?query=echo([hello, world, how are you today?])%3CforEach%3Ctranslate(from:en,to:es)%3E%3E" target="_blank">`echo([hello, world, how are you today?])<forEach<translate(from:en,to:es)>>`</a>
- Translating only one element from the list of strings, with numeric keys:<br/><a href="https://newapi.getpop.org/api/graphql/?query=echo([hello,%20world,how%20are%20you%20today?])%3CadvancePointerInArray(path:0)%3Ctranslate(from:en,to:es)%3E%3E" target="_blank">`echo([hello, world, how are you today?])<advancePointerInArray(path: 0)<translate(from:en,to:es)>>`</a>
- Translating only one element from the list of strings, with keys as strings:<br/><a href="https://newapi.getpop.org/api/graphql/?query=echo([first:hello,second:world,third:how%20are%20you%20today?])%3CadvancePointerInArray(path:second)%3Ctranslate(from:en,to:es)%3E%3E" target="_blank">`echo([first:hello, second:world, third:how are you today?])<advancePointerInArray(path:second)<translate(from:en,to:es)>>`</a>
- Translating an array of arrays:<br/><a href="https://newapi.getpop.org/api/graphql/?query=echo([[one,two,three],[four,five,six],[seven,eight,nine]])%3CforEach%3CforEach%3Ctranslate(from:en,to:es)%3E%3E%3E" target="_blank">`echo([[one, two, three], [four, five, six], [seven, eight, nine]])<forEach<forEach<translate(from:en,to:es)>>>`</a>
- And so on, and on, and on.

Embeddable fields is a watered-down version of composable fields, good enough for templating, but not for more advanced use cases.

> In your article you argue, that it is better to do this on GraphQL, but I don't understand why it would be.

I think there is value in GraphQL having additional capabilities. If a GraphQL query can execute a complex operation all by itself, the query may become more difficult, but the overall application would become much simpler.

For instance, instead of a typical workflow of using GraphQL to retrieve data, process the data in the client with JavaScript, and then execute some operation in the server with this data, a single GraphQL query with meta-scripting capabilities can completely do away with the client. This is not just fewer lines of code, it's also fewer systems involved.

As an example that I've implemented for demonstration purposes, a single query [can send a localized newsletter](https://graphql-by-pop.com/guides/localized-newsletter.html).

This is not far-fetched. I think GraphQL can be considered good for more than just fetching and posting data, because in this modern world of APIs interacting with cloud-based services, it's difficult to determine what is fetching data, and what is executing functionality.

For instance, are these cases within the confines of just fetching/posting data?

- When uploading an image to the site, we upload it to an S3 bucket
- When creating a post, we send an email notification
- When adding a comment on a static site hosted on Netlify, we trigger a new build
- When executing a query, we save the traces on AWS DynamoDB or Kinesis

These are all operations that can be perfectly integrated within the GraphQL service, and that are typically found on a CI/CD pipeline. Imagine if the pipeline stages were GraphQL queries. GraphQL would then become the interface not just for fetching/posting data, but also for interacting with services.

I'm pretty confident that providing a robust support to GraphQL to interact with these cloud-based services can only make our API more powerful, capable of supporting more use cases, and better prepared for new requirements in the future.

> Another principle for GraphQL was coined by Lee Byron: A GraphQL server should only expose queries, that it can fulfill efficiently.

These are not contradictory propositions. If well architected, the GraphQL server will not necessarily degrade its performance. GraphQL by PoP, for instance, resolves the query with [linear complexity time on the number of types](https://blog.logrocket.com/simplifying-the-graphql-data-model/), so it supports composable fields to any number of levels without a scratch.

> The more features we add to GraphQL, the harder it becomes to ensure, that the queries are efficiently executable.

Same as above.

> Furthermore, your functionality requires consecutive resolver executions for one single field. This fundamentally changes how queries are executed (in a way that IMO is incompatible with the spec).

That's up to interpretation. I have not seen it described in the spec, and I believe it should not be there, since the spec is about defining standards on how the API must behave, and not about the nitty-gritty of the server's implementation.

> GraphQL is designed to be simple on purpose.

I agree that these changes add complexity to the GraphQL servers, and extra capabilities to the GraphQL queries that make it more difficult to learn.

But at the same time, they make the GraphQL service more powerful and versatile, and enable the architecture of the overall application to become simpler.

For me the question is, is it worth it?