---
title: 🚫 GDPR illegal - Couchsurfing may be keeping your (deleted) photos
metaDesc: And possibly you didn't know!
socialImage: /images/cs-not-deleted-photo.png
date: '2020-08-28'
tags:
  - couchsurfing
  - data
  - gdpr
---

Because [Couchsurfing is dead](https://leoloso.com/posts/couchsurfing-is-dead/) (or, more appropriately, Couchsurfing has been killed), I requested to delete my account from the site. And it's been done: [my profile](https://www.couchsurfing.com/people/leoloso) does not exist anymore.

But, surprise surprise, they had not deleted my photos! For instance, this photo of mine was still hosted in their cloud:

![A non-deleted photo of mine](/images/cs-not-deleted-photo.png "A non-deleted photo of mine")

These guys should have deleted all my data, absolutely all of it, including photos. To be sure that that would happen, I explicitly mentioned this when requesting to close down my account:

![Requesting to delete my data](/images/cs-request-delete-data.png "Requesting to delete my data")

They deleted my account, and replied back saying that they were closing the ticket. As I noticed that my photos were still there, I replied to that same email, asking them, once again, to delete them:

![Requesting to delete my data, again](/images/cs-request-delete-data-again.png "Requesting to delete my data, again")

To which I got a response, saying that my ticket would be handled within 3 days:

![New ticket for old request](/images/cs-ticket-last-response.png "New ticket for old request")

(Btw, if they deleted my data from their customer support tool, how does this system still know that my name is Leonardo? I hope they got it from the email headers, instead of lying about it.)

After one week, no response, my photos were still there. I wrote a new ticket to them:

![Newer ticket for old request](/images/cs-new-ticket-delete-data.png "Newer ticket for old request")

And what was their response? That they needed 1 month to delete my photos!!!

![1 month to delete photos!](/images/cs-new-ticket-delete-data-1.png "1 month to delete photos!")

I replied back, asking why deleting a folder from AWS S3 (the hosting service from Amazon) takes such a long time:

![How can it take 30 days to delete photos?](/images/cs-new-ticket-delete-data-2.png "How can it take 30 days to delete photos?")

I use AWS myself, and I know what it takes: Login to AWS => Click on the S3 link => Browse to the folder => Delete all the images => Delete the folder. Amount of time required: 5 minutes. 15 minutes max.

I got their response, saying they were escalating this issue:

![Escalating the issue](/images/cs-new-ticket-delete-data-3.png "Escalating the issue")

But, surprise surprise, they never contacted me again! And even more, 2 weeks later I got an automatic response, saying that my ticket was being closed because they hadn't heard back from me!:

![Not hearing back from me and trying to close my ticket, huh?](/images/cs-new-ticket-delete-data-4.png "Not hearing back from me and trying to close my ticket, huh?")

I had to reply again, just to keep the ticket open:

![Don't dare close my ticket!](/images/cs-new-ticket-delete-data-5.png "Don't dare close my ticket!")

And then I got a new response: they still needed 2 weeks to "manually" process my request:

![We need 2 weeks more](/images/cs-new-ticket-delete-data-6.png "We need 2 weeks more")

That was the last interaction with them. These 2 weeks, I kept checking if my photos were there. Just before the 2 weeks were over, the photos had been deleted.

Escalation? What escalation? They took their whole time. Giving me a response after they had deleted my photos? Nops, that never happened. How did Zendesk know my name? They never explained. What other data do they still have about me? Who knows?

## Manually deleting pics?

The main issue is: why did they have to manually delete my photos? When I requested to have my data deleted, that meant all my data, including the photos. If they have some automatic system to delete data, they seem to be cherry-picking what data to delete.

## Attending to some requests, ignoring others

I had to write not once but twice, to have my data actually deleted, and wait and wait and wait.

My wife also wrote to them, twice, to have her photos deleted. But they never replied back to her, and up to this day her photos are still in their cloud.

## What will happen next

I know what will happen. If they come across this blog post, the Couchsurfing guys will make some excuse, they will say it was a mistake, "we are very sorry, but look, we have deleted the images now, and we'll take better care in the future, because we care about our community, oh yes we love our community" (and then they'll repeat the word community 37 times).

## Invoking GDPR, anyone?

I wouldn't be surprised that this is not an isolated case (and my wife's photos are still hosted by them, after she repeatedly requested for their deletion). I bet that they are only deleting the user data from their website database, but they are keeping some other assets, such as the user photos.

And this, through the GDPR legislation, **is illegal**.

I'm not European, so I can't do anything about it. But if you're European, and you have requested to delete your CS account and all its data, you can try to **find out if they have deleted your images!**.

If they still hold your photos (which is your data, not theirs), they could be punished through GDPR. 