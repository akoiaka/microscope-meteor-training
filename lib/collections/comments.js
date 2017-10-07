Comments = new Mongo.Collection('comments');
Meteor.methods({
    commentInsert: function(commentAttributes) {
        check(this.userId, String);
        check(commentAttributes, {
            postId: String,
            body: String
        });
        var user = Meteor.user();
        var post = Posts.findOne(commentAttributes.postId);
        if (!post)
            throw new Meteor.Error('invalid-comment', 'Vous devez commenter sur un post');
        comment = _.extend(commentAttributes, {
            userId: user._id,
            author: user.username,
            submitted: new Date()
        });
        // update the post with the number of comments
        Posts.update(comment.postId, {$inc: {commentsCount: 1}});
        // Finalement, nous pouvons simplement supprimer le helper commentsCount
        // de client/templates/posts/post_item.js, puisque le champ est maintenant
        // directement disponible sur le post.
        // return Comments.insert(comment);
        // }
        // Cela ne fait rien de bien fantaisiste, on s'assure simplement que l'utilisateur
        // est connecté, que le commentaire a un corps (body), et qu'il est lié au post.

        // crée le commentaire et enregistre l'id
        comment._id = Comments.insert(comment);
        // crée maintenant une notification, informant l'utilisateur qu'il y a eu un commentaire
        createCommentNotification(comment);
        return comment._id;
    }
});

