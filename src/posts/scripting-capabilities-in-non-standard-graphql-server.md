---
title: 💪 Scripting capabilities in non-standard GraphQL server
metaDesc: Showing how GraphQL could get more elegant and powerful
socialImage: /images/graphql-by-pop-logo.jpg
date: '2020-10-03'
tags:
  - graphql
  - spec
---

Last week I made a [proposal to add embeddable fields to GraphQL](https://leoloso.com/posts/proposal-for-embeddable-fields-in-graphql-query/), but it didn't get a lot of support. I got the feedback that the extra complexity added to the server doesn't justify the benefits of this new feature, as in [this comment on Reddit](https://www.reddit.com/r/graphql/comments/j043rw/proposal_for_embeddable_fields_in_graphql/g6pvqcj) (which I replied to through [this post](https://leoloso.com/posts/justifying-embeddable-fields-in-graphql-query/)).

My proposed feature then appears to be not about GraphQL as we know it nowadays, but about an über GraphQL, or what GraphQL could possibly be. That's either a problem, or an opportunity. In [this write-up](https://artsy.github.io/blog/2018/05/08/is-graphql-the-future/), Alan Johnson says:

> [...] the execution model of GraphQL is in many ways just like a scripting language interpreter. The limitations of its model are strategic, to keep the technology focused on client-server interaction. What's interesting is that you as a developer provide nearly all of the definition of what operations exist, what they mean, and how they compose. For this reason, I consider GraphQL to be a __meta-scripting language__, or, in other words, a toolkit for building scripting languages.

I agree with this observation, but then I wonder: Where do these limitations start? What should be allowed, and what not? If any feature made GraphQL's scripting capabilities a bit more visible, gave a bit more control to the developer, and made the query a bit more powerful, should that be straightforward rejected? Or could it be given a chance?

## Show me the stuff!

Let's talk business now. Here is something that GraphQL is not good at.

Say that you have a `@translate` directive that is applied on a `String`, as in [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%20%22en%22%2C%20to%3A%20%22es%22)%0A%20%20%7D%0A%7D):

```graphql
{
  posts {
    id
    title @translate(from: "en", to: "es")
  }
}
```

You cannot apply `@translate` on a field different than a `String`. If you need to, you must then create a new directive, which involves extra effort (often being ad-hoc) and pollutes the schema:

- If a field returns `[String]`, you'd need to create another directive `@translateArrays` 

- If only some entries from the array must be translated, you need to add an optional argument `$keys: [String]` to specify which keys to translate

- If the keys are not strings, but are numeric, you need another argument `$numericKeys: [Int]` as to avoid type conflicts

- If instead of an array, you get an array of arrays, you need yet another directive

And so on, concerning any random requirement from your clients.

As a result, the schema might eventually become unwieldy.

---

So, how could this situation be improved for GraphQL?

If GraphQL had capabilities to compose or manipulate fields, then a few elements could already satisfy all possible combinations.

[GraphQL by PoP](https://graphql-by-pop.com) (the engine powering the recently launched [GraphQL API for WordPress](https://gatographql.com)) is a GraphQL server because it respects the [GraphQL spec](https://spec.graphql.org/), but is also a non-standard API server that provides other capabilities, including [composable fields](https://github.com/graphql/graphql-spec/issues/682) and [composable directives](https://github.com/graphql/graphql-spec/issues/683).

Let's see how this server can satisfy all combinations described above, with just a few elements:

> **Notes:**
> 
> - GraphQL by PoP relies on the URL-based [PQL syntax](https://graphql-by-pop.com/docs/extended/pql.html), so you can click on the links to execute the query and see its response
> - Field `Root.echo` is used to build the arrays
> - `forEach` and `advancePointerInArray` are directives that composes another directive

Translating posts as strings (<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%3Ctranslate(from:en,to:es)%3E" target="_blank">run query</a>):

```less
posts.title<
  translate(from:en, to:es)
>
```

Translating a list of strings (<a href="https://newapi.getpop.org/api/graphql/?query=echo([hello, world, how are you today?])%3CforEach%3Ctranslate(from:en,to:es)%3E%3E" target="_blank">run query</a>):

```less
echo([
  hello,
  world,
  how are you today?
])<
  forEach<
    translate(from:en,to:es)
  >
>
```

Translating only one element from the list of strings, with numeric keys (<a href="https://newapi.getpop.org/api/graphql/?query=echo([hello,%20world,how%20are%20you%20today?])%3CadvancePointerInArray(path:0)%3Ctranslate(from:en,to:es)%3E%3E" target="_blank">run query</a>):

```less
echo([
  hello,
  world,
  how are you today?
])<
  advancePointerInArray(path: 0)<
    translate(from:en,to:es)
  >
>
```

Translating only one element from the list of strings, with keys as strings (<a href="https://newapi.getpop.org/api/graphql/?query=echo([first:hello,second:world,third:how%20are%20you%20today?])%3CadvancePointerInArray(path:second)%3Ctranslate(from:en,to:es)%3E%3E" target="_blank">run query</a>):

```less
echo([
  first:hello,
  second:world,
  third:how are you today?
])<
  advancePointerInArray(path:second)<
    translate(from:en,to:es)
  >
>
```

Translating an array of arrays (<a href="https://newapi.getpop.org/api/graphql/?query=echo([[one,two,three],[four,five,six],[seven,eight,nine]])%3CforEach%3CforEach%3Ctranslate(from:en,to:es)%3E%3E%3E" target="_blank">run query</a>):

```less
echo([[
  one,
  two,
  three
], [
  four,
  five,
  six
], [
  seven,
  eight,
  nine
]])<
  forEach<
    forEach<
      translate(from:en,to:es)
    >
  >
>
```

And so on, concerning any random requirement from your clients.

In my opinion, these features make the queries more powerful, and the schema more elegant. So they could be perfectly considered to be added to GraphQL.

## Should consider adding extra scripting capabilities to GraphQL?

Bringing these additional scripting capabilities to GraphQL, wouldn't it be more valuable than not?

I understand that there is more complexity added to the server. But that's a one-time off. The GraphQL server maintainers can implement these features in a few months, and developers would be able to use them forever.

Isn't that a good tradeoff?