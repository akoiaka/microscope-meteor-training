// -- POUR ERREURS --

Template.postEdit.onCreated(function() {
    Session.set('postEditErrors', {});
});
Template.postEdit.helpers({
    errorMessage: function(field) {
        return Session.get('postEditErrors')[field];
    },
    errorClass: function (field) {
        return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
    }
});
// -- POUR ERREURS --

Template.postEdit.events({
    'submit form': function(e) {
        e.preventDefault();

        var currentPostId = this._id;

        var postProperties = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val()
        }

        // L'événement de mise à jour du post est un peu plus long,
        // mais pas plus compliqué. Après avoir, une fois de plus,
        // empêché l'activation des événements classiques (lors de la soumission du formulaire)
        // et récupéré l'ID du post concerné, on récupère les valeurs du formulaire
        // depuis la page et on les sauvegarde dans l'objet postProperties.

        // Nous passons alors cet objet à la méthode Collection.update() de Meteor
        // avec l'opérateur $set (qui remplace un ensemble de champs)
        // et utilisons un callback pour afficher une erreur si la mise à jour est un échec
        // ou renvoie l'utilisateur sur le post concerné si la mise à jour est un succès.

        // -- POUR ERREURS --
        var errors = validatePost(postProperties);
        if (errors.title || errors.url)
            return Session.set('postEditErrors', errors);
        // -- POUR ERREURS --

        Posts.update(currentPostId, {$set: postProperties}, function(error) {
            if (error) {
                // affiche l'erreur à l'utilisateur
                // alert(error.reason);
                //on change alert error par throw error
                throwError(error.reason);
            } else {
                Router.go('postPage', {_id: currentPostId});
            }
        });
    },
    // L'événement de suppression est très simple :
    // on empêche l'activation des événements par défaut et on demande une confirmation
    // à l'utilisateur. Enfin si on l'obtient, on récupère l'ID du post actuel
    // depuis les informations de la template, on supprime le post et on redirige
    // l'utilisateur sur l'accueil.

    'click .delete': function(e) {
        e.preventDefault();

        if (confirm("Delete this post?")) {
            var currentPostId = this._id;
            Posts.remove(currentPostId);
            // Router.go('postsList');
            Router.go('home');
        }
    }
});