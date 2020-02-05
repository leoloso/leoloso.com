---
title: 😸 Submitting my first RFCs to the GraphQL spec
metaDesc: Composable fields and composable directives
socialImage: https://leoloso.com/images/graphql-logo.png
date: '2020-02-05'
tags:
  - pop
  - api
  - graphql
  - spec
---

I have just submitted my very first RFCs (Request For Comments) to the [GraphQL spec](https://github.com/graphql/graphql-spec):

1. [[RFC] Composable fields](https://github.com/graphql/graphql-spec/issues/682)
2. [[RFC] Composable directives](https://github.com/graphql/graphql-spec/issues/683)

The first one would enable to have fields compose other fields, like this:

```graphql
query {
  posts {
    date: if(
      condition: equals(
        value1: lang,
        value2: "ZH"
      ),
      then: "Y-m-d",
      else: if(
        condition: equals(
          value1: year(
            date: date
          ),
          value2: currentYear
        ),
        then: "d/M",
        else: "d/M/Y"
      )
    )
  }
}
```

The second one would allow directives compose other directives using `<>` as syntax instead of `@`, like this:

```graphql
query {
  posts:posts(limit:10) {
    tagNames
    translatedTagNames:tagNames<
      forEach<
        translate(from:"en", to:"es")
      >
    >
  }
}
```

I have already added these features on [GraphQL by PoP](https://github.com/getpop/graphql) (for instance: [query solving the 1st issue](https://newapi.getpop.org/api/graphql/?format=Y-m-d&query=posts.if(hasComments(),sprintf(%22This%20post%20has%20%s%20comment(s)%20and%20title%20%27%s%27%22,%5BcommentsCount(),title()%5D),sprintf(%22This%20post%20was%20created%20on%20%s%20and%20has%20no%20comments%22,%5Bdate(format:if(not(empty(%24format)),%24format,d/m/Y))%5D))@postDesc), [query solving the 2nd issue](https://newapi.getpop.org/api/graphql/?query=posts(limit:10).tagNames%7CtagNames@translatedTagNames%3CforEach%3Ctranslate(from:%22en%22,%20to:%22es%22)%3E%3E)), and they have proved so powerful that I have no doubt that the GraphQL community could also benefit from them. They just make so much sense! 

I wonder if they will be accepted? I certainly hope so! 😆