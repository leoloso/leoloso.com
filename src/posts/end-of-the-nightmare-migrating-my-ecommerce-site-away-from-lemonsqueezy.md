---
title: "🍋 End of the nightmare: Migrating my ecommerce site away from LemonSqueezy"
metaDesc: "How Stripe's acqui-kill of LemonSqueezy forced me to migrate my ecommerce and lose sales along the way."
socialImage: /images/lemonsqueezy/lemonsqueezy-error.webp
date: '2026-03-05'
tags:
  - ecommerce
  - lemonsqueezy
  - wordpress
---

For the last years I’ve been using LemonSqueezy as my ecommerce provider to sell my plugins, [Gato AI Translations for Polylang](https://gatoplugins.com/plugins/ai-translations-for-polylang) and [Gato GraphQL](https://gatographql.com/).

For a long time I was genuinely happy with it. The product hit most of the boxes I cared about: selling digital products, newsletter, and affiliates.

(There were annoyances here and there. One in particular was especially painful: since assets are not shared across variants, every release cost me ~1 hour of drag-and-drop uploads, with some 20 products × 8 variants.)

Overall, the service was solid enough that I could live with the rough edges.

### Stripe acquires LemonSqueezy… and everything freezes

That changed when Stripe acquired LemonSqueezy ([announcement](https://www.lemonsqueezy.com/blog/stripe-acquires-lemon-squeezy)).

Since then, product development has effectively stopped. According to [this comment](https://lemonsqueezy.nolt.io/widget/786) (which, notably, has never been refuted):

> The entire LS team is currently working on Stripe. They are essentially recreating LS’s Merchant of Record functionality within Stripe.
>
> Once the updates in Stripe are completed, all LS users will be migrated to Stripe. LS will be discontinued.

The roadmap page was silently removed, and the “Roadmap” link in the footer (`www.lemonsqueezy.com/roadmap`) now just redirects to their blog. (They haven’t even bothered to remove the link from the footer. I honestly don’t know if they even realized it’s still there.)

No roadmap and no new features already sucks. But it’s worse than that.

They had publicly promised features like marketing automation, which I had been planning to rely on. When a company announces functionality, you start making plans around it. Having that silently abandoned feels like a betrayal.

And if there’s no active dev team, there’s also nobody fixing bugs.

### Support theater instead of bug fixing

I’ve reported many bugs over many months. None of them were fixed. Not a single one.

The pattern was always the same. I’d send an email to their support team, and they’d send something along the lines of:

> I would like to inform you that I have escalated your concern to our dedicated team. One of our team member will contact you once we have an update to share. Kindly keep an eye on your email. 

![LemonSqueezy's copy-paste support answer](/images/lemonsqueezy/lemonsqueezy-email-support-example.webp "LemonSqueezy's copy-paste support answer")

And then… nothing. No follow-up, no workaround, no acknowledgement that the bug still exists and is hurting people’s businesses.

Here are some of the things I tried to get them to fix. Notice my ever-growing level of desperation by the end of each interaction.

#### Broken affiliate tracking on gatographql.com

The affiliate tracking script simply refused to work on `gatographql.com`. One affiliate actually stopped running a campaign for my plugin because their clicks weren’t being tracked at all.

![Support email: Affiliate tracking not working](/images/lemonsqueezy/lemonsqueezy-email-support-affiliate.webp "Support email: Affiliate tracking not working")

#### LemonSqueezy invalidating *all* new Gmail newsletter subscribers

LemonSqueezy started invalidating every new Gmail address subscribing to my newsletter.

![Support email: LemonSqueezy invalidating Gmail subscribers](/images/lemonsqueezy/lemonsqueezy-email-support-subscribers-problem.webp "Support email: LemonSqueezy invalidating Gmail subscribers")

#### Double opt‑in emails not being sent

Users would not receive the “double opt‑in” confirmation email when subscribing to the newsletter.

![Support email: LemonSqueezy double opt‑in emails not arriving](/images/lemonsqueezy/lemonsqueezy-email-support-double-optin.webp "Support email: LemonSqueezy double opt‑in emails not arriving")

Because this bug was never fixed, I had to disable double opt‑in entirely. The result: I’ve been flooded with spam signups ever since. Every day I have to check whether there are new spam subscribers and manually archive them.

![Spam notifications after disabling double opt‑in](/images/lemonsqueezy/lemonsqueezy-notifications-spam-emails.webp "Spam notifications after disabling double opt‑in")

#### Zero help when I had trouble registering a Stripe account

When I had trouble registering a new Stripe account, LemonSqueezy support was… not helpful.

![Support email: LemonSqueezy support not helping with Stripe account issues](/images/lemonsqueezy/lemonsqueezy-email-support-stripe-account.webp "Support email: LemonSqueezy support not helping with Stripe account issues")

#### A second shop that never worked

I wanted to create a second shop for Gato Plugins, separate from Gato GraphQL.

That never worked. Their onboarding kept throwing an exception during identity verification, so I was forced to run a single “Gato” shop for both Gato Plugins and Gato GraphQL.

![Support email: LemonSqueezy second store creation failing](/images/lemonsqueezy/lemonsqueezy-email-support-2ndstore.webp "Support email: LemonSqueezy second store creation failing")

#### Prices mysteriously reverting to an old version

At one point, LemonSqueezy reverted my product prices back to a previous version.

I only noticed because a sale came in with a lower-than-expected amount. That’s money simply gone.

After I complained publicly on Twitter, Nathalie from support reached out and said they’d investigate ASAP.

They never came back.

And then, about a month later, **the exact same problem happened again**.

Despite all of this, I stayed, because I still needed to sell my products and I kept hoping they’d eventually turn things around.

### The final straw: 500s everywhere and lost sales

About a month ago, their servers started throwing “Internal Server Error” more and more often. It got progressively worse until at times **one out of three interactions** with the platform resulted in an error.

![Frequent internal server errors on LemonSqueezy](/images/lemonsqueezy/lemonsqueezy-error.webp "Frequent internal server errors on LemonSqueezy")

This wasn’t just in the dashboard. It also happened when customers tried to purchase my plugins.

I have **two confirmed failed sales**, where users wrote to me saying they tried to buy the plugin, got an error, and then lost trust and left.

And I have no idea how many others simply tried, failed, and silently left the site.

At that point I sent them a last email with the subject **“Moving away from LS”**:

![My final email to LemonSqueezy](/images/lemonsqueezy/lemonsqueezy-final-email.webp "My final email to LemonSqueezy")

(The blog post I mention in that email is [this one](https://gatoplugins.com/blog/having-trouble-purchasing-the-plugin).)

Did I really think they’d react? Of course not. I was being naive.

They wasted my time one last time:

![LemonSqueezy's non-response to my final email](/images/lemonsqueezy/lemonsqueezy-final-email-final.webp "LemonSqueezy's non-response to my final email")

### A product that actively makes me lose money

At this point, LemonSqueezy had crossed a line.

It wasn’t just a tool with bugs. It was a service that was:

- **Actively making me lose sales**, and
- **Actively ignoring paying customers**.

The worst part is how they kept a thin shell of “support” going — whether that’s bots or humans, I honestly can’t tell.

They kept insisting the problem was not happening (or that they “hadn’t noticed it”), even as more and more users complained. They kept asking me for more data, more details, even screen recordings. They kept promising they’d fix it “soon”.

Nothing ever changed.

At some point I had to stop lying to myself and accept reality:

> **LemonSqueezy is completely, utterly unusable.**

Stripe’s acquisition was not an acqui-hire. It was an **acqui‑kill**.

There’s no other way to explain their behavior: Stripe acquired LemonSqueezy in order to extract the technology and then let the existing product quietly die.

### Migration wasn’t optional anymore

At that point, switching to a new platform was no longer something I “should probably do at some point”. It became an imperative.

I had to:

- Find a new ecommerce provider
- Integrate it into `gatoplugins.com` and `gatographql.com`
- Update the plugins so that license validation hits the new provider’s API instead of LemonSqueezy

Doing all of this took me around two weeks.

Two weeks during which I couldn’t sell my plugins at all. 😰

But it’s now done. 🙏

(I still need to replace LemonSqueezy for newsletters and affiliates, but that can wait a few more days.)

### LemonSqueezy fought back to the very end

On the last plugin update that was still hosted on LemonSqueezy (the new version points to the new platform), some users complained that they couldn’t update the plugin at all.

![Plugin update failing while still on LemonSqueezy](/images/lemonsqueezy/lemonsqueezy-update-failed.webp "Plugin update failing while still on LemonSqueezy")

Fitting, in a way. LemonSqueezy kept throwing errors right until the very end.

But that’s it. I’m done.

**The LemonSqueezy nightmare is finally over.** 😮‍💨

