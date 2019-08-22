---
title: Today I published my 1st WordPress plugin, yay!
metaDesc: My plugin “Block Metadata” extracts all the metadata from all blocks inside of a blog post, enabling to implement the “COPE” strategy in WordPress 🙏
socialImage: https://leoloso.com/images/block-metadata-icon.jpg
date: '2019-08-22'
tags:
  - wordpress
  - plugin
  - gutenberg
  - block
  - content
  - cope
  - api
---

Today is a special day for me: I published my first ever plugin on the WordPress repository!

![Victory!](/images/victory.png)

The plugin is called "Block Metadata", and its use case is very simple: it extracts all the metadata for all the blocks inside of a blog post, converting this metadata into a medium-agnostic format. 

The plugin's goal is to implement the [Create Once, Publish Everywhere](https://www.programmableweb.com/news/cope-create-once-publish-everywhere/2009/10/13) strategy (alias COPE), enabling to have our Gutenberg-edited blog post become the single source of truth for all content, for all different mediums or platforms: web, email/newsletters, iOS/Android apps, home assistants (like Amazon Alexa), car-entertainment systems, and so on.

![Banner for my plugin "Block Metadata"](/images/block-metadata-banner.jpg)

I learnt about the COPE concept several years ago, watching Karen McGrane's talk [Content in a Zombie Apocalypse](https://karenmcgrane.com/talks/content-in-a-zombie-apocalypse/). However, only now this strategy is easily implementable, thanks to Gutenberg. Or, to be more precise, thanks to the block-based architecture of Gutenberg. (Actually, Gutenberg could provide a better support for COPE making it more performant, but the current implementation still works fairly well.)

The plugin provides a REST API endpoint, `/wp-json/block-metadata/v1/metadata/{POST_ID}`, which transforms the Gutenberg blog post content, from this:

```html
<!-- wp:block {"ref":1500} /-->

<!-- wp:image {"id":262,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://ps.w.org/gutenberg/assets/banner-1544x500.jpg" alt="" class="wp-image-262"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p><em>Etiam tempor orci eu lobortis elementum nibh tellus molestie. Neque  egestas congue quisque egestas. Egestas integer eget aliquet nibh  praesent tristique. Vulputate mi sit amet mauris. Sodales neque sodales  ut etiam sit. Dignissim suspendisse in est ante in. Volutpat commodo sed  egestas egestas. Felis donec et odio pellentesque diam. Pharetra vel  turpis nunc eget lorem dolor sed viverra. Porta nibh venenatis cras sed  felis eget. Aliquam ultrices sagittis orci a. Dignissim diam quis enim  lobortis. Aliquet porttitor lacus luctus accumsan. Dignissim convallis  aenean et tortor at risus viverra adipiscing at.</em></p>
<!-- /wp:paragraph -->

<!-- wp:core-embed/youtube {"url":"https://www.youtube.com/watch?v=9pT-q0SSYow","type":"video","providerNameSlug":"youtube","className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed-youtube wp-block-embed is-type-video is-provider-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">
https://www.youtube.com/watch?v=9pT-q0SSYow
</div><figcaption><strong>This is the video caption</strong></figcaption></figure>
<!-- /wp:core-embed/youtube -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:quote -->
<blockquote class="wp-block-quote"><p>Saramago sonogo</p><p>En la lista del longo</p><cite><em><a href="https://yahoo.com">alguno</a></em></cite></blockquote>
<!-- /wp:quote --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"id":70,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://ps.w.org/gutenberg/assets/banner-1544x500.jpg" alt="" class="wp-image-70"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:heading -->
<h2>Some heading here</h2>
<!-- /wp:heading -->

<!-- wp:gallery {"ids":[1502,1505,1503,1504]} -->
<ul class="wp-block-gallery columns-3 is-cropped"><li class="blocks-gallery-item"><figure><img src="https://newapi.getpop.org/wp/wp-content/uploads/2019/08/Sample-jpg-image-50kb.jpg" alt="" data-id="1502" data-link="https://newapi.getpop.org/uncategorized/cope-with-wordpress-post-demo-containing-plenty-of-blocks/attachment/sample-jpg-image-50kb/" class="wp-image-1502"/><figcaption>Caption 1st image</figcaption></figure></li><li class="blocks-gallery-item"><figure><img src="https://newapi.getpop.org/wp/wp-content/uploads/2019/08/setting-rest-fields-1024x145.png" alt="" data-id="1505" data-link="https://newapi.getpop.org/uncategorized/cope-with-wordpress-post-demo-containing-plenty-of-blocks/attachment/setting-rest-fields/" class="wp-image-1505"/></figure></li><li class="blocks-gallery-item"><figure><img src="https://newapi.getpop.org/wp/wp-content/uploads/2019/08/Sample-jpg-image-100kb.jpg" alt="" data-id="1503" data-link="https://newapi.getpop.org/uncategorized/cope-with-wordpress-post-demo-containing-plenty-of-blocks/attachment/sample-jpg-image-100kb/" class="wp-image-1503"/><figcaption>Caption 3rd image</figcaption></figure></li><li class="blocks-gallery-item"><figure><img src="https://newapi.getpop.org/wp/wp-content/uploads/2019/08/banner-1544x500-1024x332.jpg" alt="" data-id="1504" data-link="https://newapi.getpop.org/uncategorized/cope-with-wordpress-post-demo-containing-plenty-of-blocks/attachment/banner-1544x500/" class="wp-image-1504"/><figcaption>Final <strong>caption</strong> <a href="https://getpop.org">for all</a></figcaption></figure></li></ul>
<!-- /wp:gallery -->
```

Into this:

```javascript
[
  {
    "blockName": "core/paragraph",
    "meta": {
      "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dolor sed viverra ipsum nunc aliquet bibendum enim. In massa tempor nec feugiat. Nunc aliquet bibendum enim facilisis gravida. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Amet luctus venenatis lectus magna fringilla. Volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque in. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Sagittis orci a scelerisque purus semper eget duis. Nulla pharetra diam sit amet nisl suscipit. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in. Fusce ut placerat orci nulla. Pharetra vel turpis nunc eget lorem dolor. Tristique senectus et netus et malesuada."
    }
  },
  {
    "blockName": "core/image",
    "meta": {
      "src": "https://ps.w.org/gutenberg/assets/banner-1544x500.jpg"
    }
  },
  {
    "blockName": "core/paragraph",
    "meta": {
      "content": "<em>Etiam tempor orci eu lobortis elementum nibh tellus molestie. Neque  egestas congue quisque egestas. Egestas integer eget aliquet nibh  praesent tristique. Vulputate mi sit amet mauris. Sodales neque sodales  ut etiam sit. Dignissim suspendisse in est ante in. Volutpat commodo sed  egestas egestas. Felis donec et odio pellentesque diam. Pharetra vel  turpis nunc eget lorem dolor sed viverra. Porta nibh venenatis cras sed  felis eget. Aliquam ultrices sagittis orci a. Dignissim diam quis enim  lobortis. Aliquet porttitor lacus luctus accumsan. Dignissim convallis  aenean et tortor at risus viverra adipiscing at.</em>"
    }
  },
  {
    "blockName": "core-embed/youtube",
    "meta": {
      "url": "https://www.youtube.com/watch?v=9pT-q0SSYow",
      "caption": "<strong>This is the video caption</strong>"
    }
  },
  {
    "blockName": "core/quote",
    "meta": {
      "quote": "Saramago sonogo\\nEn la lista del longo",
      "cite": "<em>alguno</em>"
    }
  },
  {
    "blockName": "core/image",
    "meta": {
      "src": "https://ps.w.org/gutenberg/assets/banner-1544x500.jpg"
    }
  },
  {
    "blockName": "core/heading",
    "meta": {
      "size": "xl",
      "heading": "Some heading here"
    }
  },
  {
    "blockName": "core/gallery",
    "meta": {
      "imgs": [
        {
          "src": "https://newapi.getpop.org/wp/wp-content/uploads/2019/08/Sample-jpg-image-50kb.jpg",
          "width": 300,
          "height": 300
        },
        {
          "src": "https://newapi.getpop.org/wp/wp-content/uploads/2019/08/setting-rest-fields.png",
          "width": 1738,
          "height": 246
        },
        {
          "src": "https://newapi.getpop.org/wp/wp-content/uploads/2019/08/Sample-jpg-image-100kb.jpg",
          "width": 689,
          "height": 689
        },
        {
          "src": "https://newapi.getpop.org/wp/wp-content/uploads/2019/08/banner-1544x500.jpg",
          "width": 1544,
          "height": 500
        }
      ]
    }
  }
}
```

Notice how different block types have different properties extracted from them: 

- a paragraph block has its content extracted
- a Youtube embed block has the URL and video playing properties (autoplay, allowfullscreen, etc)
- an image block extracts the image source and dimensions of the image
- etc

To see it working live, check out these links: a random [blog post](https://nextapi.getpop.org/posts/cope-with-wordpress-post-demo-containing-plenty-of-blocks/) (with plenty of Gutenberg blocks in it), its [data added by Gutenberg](https://nextapi.getpop.org/wp-json/block-metadata/v1/data/1499) on each block in the post, and, finally, its [extracted medium-agnostic metadata](https://nextapi.getpop.org/wp-json/block-metadata/v1/metadata/1499), listing properties on a block-by-block basis.

There is more information on how it works on the slides from my presentation **COPE with WordPress** @ [WordCamp Singapore 2019](https://2019.singapore.wordcamp.org/sessions/#wcorg-session-1070) last week [source](https://slides.com/leoloso/cope-with-wp):

<iframe src="//slides.com/leoloso/cope-with-wp/embed" width="576" height="420" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

If you install the plugin and find any problem, please let me know and I'll fix it. If you use it and find it useful, let me know and I'll celebrate! 🥳

![Celebrate!](/images/celebration-time.jpg)