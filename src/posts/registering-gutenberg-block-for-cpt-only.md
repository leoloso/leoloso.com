---
title: 🔥 Registering a Gutenberg block for a specific Custom Post Type only
metaDesc: Avoid polluting the WordPress editor with unneeded blocks
socialImage: /images/gutenberg-logo.png
date: '2021-05-08'
tags:
  - wordpress
  - gutenberg
  - development
---

For my GraphQL API for WordPress plugin (to be released soon, yay!), I have created several Custom Post Types, which are elegantly operated through custom Gutenberg blocks.

For instance, the GraphiQL block is used to create persisted GraphQL queries:

![Creating a persisted GraphQL query with a custom GraphiQL block](/images/graphql-query-gutenberg-block.png)

Now, this block is not a content block, but a configuration block: it is used by the Custom Post Type (or "CPT") called "GraphQL Persisted Query" to configure the GraphQL server. 

I do not want to make this block available when editing a normal post, since it just makes no sense there. Sure, I could just leave it there and never use it, but then the WordPress editor would be polluted with blocks that I do not need, and can't even use, and because they are still loaded the editor takes longer to initialize. So removing it completely whenever not needed seems like a very good idea.

So I wrote a piece for Design Bombs explaining how to do this, using PHP code only: 

[Registering Gutenberg blocks for a certain custom post type only, using PHP (not JS!)](...)

I consider this solution better than the [official JavaScript-based solution](https://developer.wordpress.org/block-editor/developers/filters/block-filters/#using-a-blacklist), because it's faster, requires less code, and it generally makes more sense (why would you register something in PHP to immediately unregister it in JavaScript? 🤔)

Enjoy! 👋🏻
