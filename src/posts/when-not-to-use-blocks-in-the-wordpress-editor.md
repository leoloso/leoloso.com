---
title: 🙅🏻‍♂️ When NOT to use blocks in the WordPress editor
metaDesc: Showing a design that can't be satisfied through blocks
socialImage: /images/accordion-video-opened.jpg
date: '2050-06-13'
tags:
  - wordpress
  - gutenberg
  - blocks
---

It can be satisfied through components, not blocks! We gotta make the distinction!

A block is: ...

A component is: ...

On my article for CSS-Tricks, I had included ... but didn't make the cut. So I publish it here instead.

## This is what I wanted to achieve, but couldn't

My original idea was to add an accordion element right at the top of the CPT, initially closed:

![Accordion with video tutorial, initially closed](/images/accordion-video-closed.jpg)

And when opened, it would display the tutorial video, directly embedded from Vimeo:

![Accordion with video tutorial, now open](/images/accordion-video-opened.jpg)

However, this scheme didn't work out, because the accordion is a block, which is saved within the post content. Then, at least one of the following issues would take place:

- The block, containing the Vimeo video URL as an attribute, would also be saved on the Persisted Query post, for every single one of them, and it really doesn't belong there
- Alternatively, the URL could be hardcoded within the block, but then I would need to create several accordion blocks, one for each CPT
- Or otherwise, I could use the `core/html` block and initialize it with its inner HTML through the template, but this didn't work (I could pass attributes but not content through the template); and even if it did work, passing the HTML to implement an accordion (which requires CSS and maybe JS too) through the template would be a terrible idea

And then, even if all of these issues were resolved, the block could not be modified or removed, because Gutenberg shows warning messages when the template and the saved content are out of sync, which in this situation would confuse the user since the issue has nothing to do with user-provided content:

![Warning message shown when template and content are out of sync](/images/template-content-out-of-sync.jpg)

Lesson: use blocks only to edit the custom post's content, and not to provide tangential information. That's why I ended up using the sidebar panel, which is not composed of blocks. 

This decision, in turn, affected what components I chose for my solution: because the sidebar panel is rather narrow, instead of placing the video directly there, I added a button to open the video on a `<Guide>` component, which behaves as a modal window.

Now that the design is settled, it's time to implement the solution.

