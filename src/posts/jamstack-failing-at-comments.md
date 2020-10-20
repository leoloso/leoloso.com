---
title: 🙅🏻‍♀️ How the Jamstack is failing at comments
metaDesc: And why it is so
socialImage: /images/jamstack.jpg
date: '2020-10-20'
tags:
  - jamstack
  - wordpress
  - architecture
---

A few weeks ago I added [this comment in WPTavern](https://wptavern.com/matt-mullenweg-clarifies-jamstack-remarks#comment-344626), on an article where WordPress founder's Matt Mullenweg clarifies his earlier remarks that the Jamstack is "a regression for the vast majority of the people adopting it".

Since I like owing my own content, I reproduce it here in my own blog.

---

I think Matt’s brutal honesty is welcome, because most information out there about the Jamstack praises it. However, it also comes from developers using these modern new tools, evaluating their own convenience and satisfaction. As Matt points out, that doesn’t mean it makes it easier for the end user to use the software, which is what WordPress is good at.

I actually like the Jamstack, but because of how complex it is, it’s rather limiting, even to support some otherwise basic functionality.

The definitive example is comments, which should be at the core websites building communities. WordPress is extremely good at supporting comments in the site. The Jamstack is sooooo bad at it. In all these many years, nobody has been able to solve comments for the Jamstack, which for me evidences that it is inherently unsuitable to support this feature.

All attempts so far have been workarounds, not solutions. Eg:

- Netlify forms: no hierarchy, so can post a comment but not a response (unless adding some meta to the comment body? how ugly is that?)
- Storing comments in a GitHub repo: it takes a long time to merge the PR with the comment

Also, all these solutions are overtly complicated. Do I need to set-up a webhook to trigger a new build just to add a comment? And then, maybe cache the new comment in the client’s LocalStorage for if the user refreshes the page immediately, before the new build is finished? Seriously?

And then, they don’t provide the killer feature: to send notifications of the new comment to all parties involved in the discussion. That’s how communities get built, and websites become successful. Speed is a factor. But more important than speed, it is dynamic functionality to support communities. The website may look fancy, but it may well become a ghost town.

(Btw, as an exercise, you can research which websites started as WordPress and then migrated to the Jamstack, and check how many comments they had then vs now… the numbers will, most likely, be waaaaaaay down)

Another way is to not pre-render the comments, but render them dynamically after fetching it with an API. Yes, this solution works, but then you still have WordPress (or some other CMS) in the back-end to store the comments :P

The final option is to use 3rd parties such as Disqus to handle this functionality for you. Then, I will be sharing my users’ data with the 3rd party, and they may use it who knows how, and for the benefit of who (most likely, not my users’). Since I care about privacy, that’s a big no for me.

As a result, my own blog, which is a Jamstack site, doesn’t support comments! What do I do if I want feedback on a blog post? I add a link to a corresponding tweet, asking to add a comment there. I myself feel ashamed at this compromise, but given my site’s stack, I don’t see how I can solve it.

I still like my blog as a Jamstack, though, because it’s fast, it’s free, and I create all the blog posts in Markdown using VSCode. But I can’t create a community! So, as Matt says, there are things the Jamstack can handle. But certainly not everything. And possibly, not the one(s) that enable your your website to become successful.