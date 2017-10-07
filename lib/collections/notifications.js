// Puisque nous allons mettre à jour les notifications depuis le client,
// nous devons nous assurer que notre appel allow est blindé.
// Nous allons donc vérifier que :
// . l'utilisateur qui lance l'appel update possède la notification
// qui est en train d'être modifiée.
// . l'utilisateur essaie seulement de mettre à jour un seul champ.
// . ce seul champ est la propriété read de nos notifications.


    Notifications = new Mongo.Collection('notifications');

Notifications.allow({
    update: function(userId, doc, fieldNames) {
        return ownsDocument(userId, doc) &&
            fieldNames.length === 1 && fieldNames[0] === 'read';
    }
});

createCommentNotification = function(comment) {
    var post = Posts.findOne(comment.postId);
    if (comment.userId !== post.userId) {
        Notifications.insert({
            userId: post.userId,
            postId: post._id,
            commentId: comment._id,
            commenterName: comment.author,
            read: false
        });
    }
};

// Comme les articles ou commentaires, cette collection Notifications sera partagée
// côté client et serveur.
// Comme nous avons besoin de mettre à jour les notifications une fois que l'utilisateur
// les a vues, nous autorisons également les mises à jours, en s'assurant
// comme d'habitude de bien limiter les permissions aux propres données de l'utilisateur.
// Nous avons également créé une simple fonction qui surveille l'article que
// l'utilisateur commente, détermine qui devrait être notifié à ce moment,
// et insère une nouvelle notification.

// Nous créons déjà des commentaires dans une méthode côté serveur,
// donc nous pouvons juste compléter cette méthode pour appeler notre fonction.
// Nous remplacerons return Comments.insert(comment); par comment._id = Comments.insert(comment)
// afin de sauvegarder l’_id du commentaire nouvellement créé dans une variable,
// puis appellerons notre fonction createCommentNotification : (voir comments.js)