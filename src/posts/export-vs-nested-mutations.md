---
title: 🥊 @export vs nested mutations
metaDesc: Comparing 2 ways to mutate many entities in GraphQL
socialImage: /images/mutant-ninja-turtles.jpg
date: '2021-12-03'
tags:
  - graphql
  - api
  - wordpress
  - plugin
---



This is working! Write blog post
    http://pop-site.lndo.site/api/graphql/?query=posts(ids:[59,58]).id|title@orig|update(title:cambiazo).id|title|status
    pop-site.lndo.site/api/graphql/?query=posts(ids:[59,58]).id|title@orig|update(title:sprintf(%s-added,[title()])).id|title|status

Embeddable fields only works with NestedMutations!
- Soft: Because "title" must be applied on the Post type, not on Root
- Hard: Because MutationRoot doesn't have field "title"!
Then, this query with Nested Mutations disabled gives error, and that's OK, I won't fix it:
    mutation UpdatePost($content:String!) {
        id
        updatePost(
            id:571
            title: "{{ id }} - added",
            content: $content,
            status:publish
        ) {
            id
            title
            content
            status
        }
    }
    Error:
        "No FieldResolver resolves field 'sprintf' for type 'MutationRoot'"
This is working too:
    mutation UpdatePost($content:String!) {
        id
        posts(limit:5) {
            update(
                title: "{{ title }} - added",
                content: $content,
                status:publish
            ) {
                id
                title
                content
                status
            }
        }
        # posts {
        #     echoStr(value:$content)
        #     id
        #     status
        #     title
        # }
    }

This works!
    http://graphql-api-demo.lndo.site/graphiql/?query=mutation%20AddComments(%24_parentComment%3AID!%20%3D%200)%20%7B%0A%20%20addCommentToCustomPost(customPostID%3A570%2Ccomment%3A%22palangana%22)%20%40export(as%3A%22_parentComment%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20content%0A%20%20%20%20date%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%20%20customPost%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20replyComment(comment%3A%22respuesta%22%2C%20parentCommentID%3A%24_parentComment)%20%7B%0A%20%20%20%20id%0A%20%20%20%20content%0A%20%20%20%20date%0A%20%20%20%20parent%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%23%20query%20%7B%0A%23%20%20%20posts%20%7B%0A%23%20%20%20%20%20id%0A%23%20%20%20%20%20title%0A%23%20%20%20%20%20comments%20%7B%0A%23%20%20%20%20%20%20%20id%0A%23%20%20%20%20%20%20%20content%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D&operationName=AddComments
    mutation AddComments($_parentComment:ID! = 0) {
        addCommentToCustomPost(customPostID:570,comment:"palangana") @export(as:"_parentComment") {
            id
            content
            date
            author {
                name
            }
            customPost {
                id
                title
            }
        }
        replyComment(comment:"respuesta", parentCommentID:$_parentComment) {
            id
            content
            date
            parent {
                id
                content
            }
        }
    }
But better with nested mutations:
    http://graphql-api-demo.lndo.site/graphiql/?query=mutation%20AddComments%20%7B%0A%20%20addCommentToCustomPost(customPostID%3A570%2Ccomment%3A%22palangana%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20content%0A%20%20%20%20date%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%20%20customPost%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%20%20reply(comment%3A%22respuesta%22)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20date%0A%20%20%20%20%20%20parent%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%23%20query%20%7B%0A%23%20%20%20posts%20%7B%0A%23%20%20%20%20%20id%0A%23%20%20%20%20%20title%0A%23%20%20%20%20%20comments%20%7B%0A%23%20%20%20%20%20%20%20id%0A%23%20%20%20%20%20%20%20content%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D&operationName=AddComments
    mutation AddComments {
        addCommentToCustomPost(customPostID:570,comment:"palangana") {
            id
            content
            date
            author {
                name
            }
            customPost {
                id
                title
            }
            reply(comment:"respuesta") {
                id
                content
                date
                parent {
                    id
                    content
                }
            }
        }
    }
Or even better:
    http://graphql-api-demo.lndo.site/graphiql/?query=mutation%20AddComments%20%7B%0A%20%20post(id%3A570)%20%7B%0A%20%20%20%20addComment(comment%3A%22palangana%22)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20date%0A%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20customPost%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20reply(comment%3A%22respuesta%22)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20parent%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%23%20query%20%7B%0A%23%20%20%20posts%20%7B%0A%23%20%20%20%20%20id%0A%23%20%20%20%20%20title%0A%23%20%20%20%20%20comments%20%7B%0A%23%20%20%20%20%20%20%20id%0A%23%20%20%20%20%20%20%20content%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D&operationName=AddComments
    mutation AddComments {
        post(id:570) {
            addComment(comment:"palangana") {
                id
                content
                date
                author {
                    name
                }
                customPost {
                    id
                    title
                }
                reply(comment:"respuesta") {
                    id
                    content
                    date
                    parent {
                        id
                        content
                    }
                }
            }
        }
    }
