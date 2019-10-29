---
title: Backstage to "Create Once, Publish Everywhere" with WordPress
metaDesc: Story on how my article for Smashing Magazine came to be.
socialImage: https://leoloso.com/images/cool-gutenberg.jpg
date: '2020-10-29'
tags:
  - wordpress
  - gutenberg
  - cope
  - api
  - pop
  - smashing
---

Yesterday I published a new article on Smashing Magazine: ["Create Once, Publish Everywhere" with WordPress](https://www.smashingmagazine.com/2019/10/create-once-publish-everywhere-wordpress/). It describes how the new WordPress, through Gutenberg, can accomplish a comprehensive management of our content towards sharing it for different mediums, such as websites, email, apps, VR/AR, Amazon Alexa, and others. This is called the COPE strategy (for "Create Once, Publish Everywhere"). By enabling the implementation of COPE, WordPress can truly become the center of the web, from where we organize and distribute all our digital assets!

The inspiration for my article came from connecting the dots. One one side, after watching Karen McGrane's talk [Content in a Zombie Apocalypse](https://karenmcgrane.com/talks/content-in-a-zombie-apocalypse/), I understood that it is futile to keep designing our content for a specific screen size, when this is a factor we cannot control anymore (this is indisputable since the launch of the Apple Watch). Instead, we must plan for our content to adapt itself to the medium, whichever the medium is and whichever its qualities (screen-based, audio-based, goggle-based, etc). For that, the content must be medium-agnostic, and the only way to achieve this is by "separating form from content", something that is easier said than done (as I explain in my Smashing article).

On the other side, Gutenberg! Many people in the WordPress community still seem to be bitter about it, and I understand why they are so, since it greatly increases the complexity of developing the application (React is not trivial, and it is unfair that everyone now needs to become an expert developer to accomplish things that were easy to do in the past, and for which no development experience was required). However, Gutenberg also brings plenty of new opportunities that were not possible before, and that's what keeps me motivated! In our case in particular, because it is block-based (instead of blob-based), Gutenberg makes it easy to extract all metadata from all blocks added in a post, making it feasible to implement the COPE strategy. This is wonderful news for anyone having to manage content for different platforms. How difficult is to put a process in place to handle this normally? How much easier can it become through leveraging Gutenberg?

As a proof of concept to show how well it works, I created a project which exports all the block metadata added to a post through an API: [COPE with WordPress](https://github.com/leoloso/cope-with-wp). To see it working, check out [this link](https://nextapi.getpop.org/wp-json/block-metadata/v1/data/1499), which exports all metadata from [this blog post](https://nextapi.getpop.org/posts/cope-with-wordpress-post-demo-containing-plenty-of-blocks/).

After this implementation, something was still missing: Even though we can now access all metadata, not every piece of metadata is suitable for all mediums. For instance, if we are interacting with an iPod or with Amazon Alexa, then we're mostly interested in audio files; if we are using an Apple Watch, forget about reading text, it's all about images or video. Then, I set out to add content filtering capabilities to the API.

Unluckily, this proved impossible to implement for both REST (not feasible) and GraphQL (creating different types for all types of metadata is so verbose and cumbersome, that I gave up while trying). However, my project [PoP](https://github.com/leoloso/PoP) can easily support this feature, through the [GraphQL extension](https://github.com/getpop/api-graphql) that transforms the application into a GraphQL server, and by adding [field modifiers](https://github.com/getpop/field-query#field-arguments) to filter the metadata according to the type of block, as I did for project [Block Metadata for WordPress](https://github.com/leoloso/block-metadata).

Check out the results of filtering metadata through the PoP API:

- All Youtube videos added to all posts: https://nextapi.getpop.org/posts/api/graphql/?query=block-metadata(blockname:core-embed/youtube)|id|title|url
- All images from a post: https://nextapi.getpop.org/markup/markup-image-alignment/api/graphql/?query=block-metadata(blockname:core/image)|id|title

Thanks for reading!