---
title: ‼️ Single source of truth => 2 presentations for doc
metaDesc: Reusing documentation in plugin and repo
socialImage: /images/interactive-schema.png
date: '2020-08-24'
tags:
  - graphql
  - server
  - features
---

Today I released [v0.3 for plugin GraphQL API for WordPress](https://github.com/GraphQLAPI/graphql-api-for-wp/releases/tag/v0.3), shipping one of the most urgent requests: documentation for the plugin!

The plugin now ships 37 modules from 10 categories, distinguished by color:

![Modules in GraphQL API for WP](/images/module-docs.png "Modules in GraphQL API for WP")

The docs have been implemented as Markdown, and they are opened when clicking on the `View details` link below each module:

![Opening the doc for a module](/images/module-doc-view-details.png)

Since Markdown can also be viewed directly in the [GitHub repo](https://github.com/GraphQLAPI/graphql-api-for-wp), I implemented a cool feature: the same docs can be viewed within the plugin, or in the repo, from a single source of truth, but with 2 different presentations:

- Tabs + video embeds in plugin
- Long page in repo

Check out the [doc for Persisted Queries in the repo](https://github.com/GraphQLAPI/graphql-api-for-wp/blob/master/docs/en/modules/persisted-queries.md), and the same doc in the plugin:

![Reading doc for module in the plugin](/images/module-docs.gif)

Cool, isn't it? 😎

If you want to find out how it's done, the implementation code is [here](https://github.com/GraphQLAPI/graphql-api-for-wp/blob/595e6c67eb4feb8a5a2237527e9091281b355f94/src/ModuleResolvers/HasMarkdownDocumentationModuleResolverTrait.php#L69).