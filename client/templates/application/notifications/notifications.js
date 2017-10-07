// Ensuite, nous avons besoin de nous assurer que nous sélectionnons
// la bonne liste de notifications dans notre helper,
// et mettons à jour les notifications comme “lues” quand l'utilisateur clique sur le lien
// vers lequel elles pointent.

Template.notifications.helpers({
    notifications: function() {
        return Notifications.find({userId: Meteor.userId(), read: false});
    },
    notificationCount: function(){
        return Notifications.find({userId: Meteor.userId(), read: false}).count();
    }
});

Template.notificationItem.helpers({
    notificationPostPath: function() {
        return Router.routes.postPage.path({_id: this.postId});
    }
});

Template.notificationItem.events({
    'click a': function() {
        Notifications.update(this._id, {$set: {read: true}});
    }
});

// Vous pouvez penser que les notifications ne sont pas si différentes des erreurs,
// et c'est vrai que leur structure est très similaire.
// Il y a néanmoins une différence clé : nous avons créé une collection client / serveur
// synchronisée. Cela signifie que nos notifications sont persistantes et,
// tant que nous gardons le même compte utilisateur, survivront au rafraîchissement
// des navigateurs et des différents appareils.
//
