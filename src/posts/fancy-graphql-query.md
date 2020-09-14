---
title: 💪 Fancy this GraphQL query? I'm on my way to build it!
metaDesc: Using innovative features before added to the spec
socialImage: /images/sponsorable-features.png
date: '2020-09-14'
tags:
  - graphql
  - wordpress
  - plugin
  - opensource
  - sponsorship
---

The query is this one, but with no space between `{ {` and `} }` (I can't write it, or my 11ty site doesn't compile! 🤷🏻‍♂️):

```graphql
mutation {
  comment(id: 1) {
    replyToComment(data: data) {
      id @sendEmail(
        to: "{ { parentComment.author.email } }",
        subject: "{ { author.name } } has replied to your comment",
        content: "
          <p>On { { comment.date(format: \"d/m/Y\") } }, { { author.name } } says:</p>
          <blockquote>{ { comment.content } }</blockquote>
          <p>Read online: { { comment.url } }</p>
        "
      )
    }
  }
}
```

This query demonstrates how [sending notifications](https://github.com/GraphQLAPI/graphql-api-for-wp/issues/40) via Symfony Notifier will be accomplished (for email, Slack and SMS). It makes use of a few pioneering features, still being considered (to more or less extent) for the [GraphQL spec](https://spec.graphql.org/draft/):

🔥 [Nested mutations](https://github.com/graphql/graphql-spec/issues/252)<br/>
🔥 [Embeddable fields](https://graphql-by-pop.com/docs/operational/embeddable-fields.html) (based on [composable fields](https://github.com/graphql/graphql-spec/issues/682))<br/>
🔥 [Flat chain syntax](https://github.com/graphql/graphql-spec/issues/174)

---

I am working to get the funding to implement them, through my recently launched [GitHub sponsors](https://github.com/sponsors/leoloso/). In total, currently there are [23 features looking for sponsorship](https://github.com/GraphQLAPI/graphql-api-for-wp/projects/2):

<figure><a href="/images/sponsorable-features.png" target="_blank"><img src="/images/sponsorable-features.png" alt="Features looking for sponsors" loading="lazy" width="3200" height="1806"></a><figcaption>Features looking for sponsors</figcaption></figure>

Once implemented, the [GraphQL API for WordPress](https://github.com/GraphQLAPI/graphql-api-for-wp) may perfectly be the most forward-looking GraphQL in the market 🙀.

What do you think? Is it worth sponsoring this project? Want to [become a sponsor](https://github.com/sponsors/leoloso/)?

Please share with your friends and colleagues! 🙏

