Template.postSubmit.events({
    'submit form': function(e) {
        e.preventDefault();

        var post = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val()
        };

        // -- POUR LES ERREURS --
        var errors = validatePost(post);
        if (errors.title || errors.url)
            return Session.set('postSubmitErrors', errors);
        // -- POUR LES ERREURS --
        // Notez que nous utilisons return pour interrompre l'exécution du helper
        // si une erreur est présente,
        // pas parce que nous voulons réellement renvoyer cette valeur quelque part.


        Meteor.call('postInsert', post, function(error, result) {
            // affiche l'erreur à l'utilisateur et s'interrompt
            if (error)
                return alert(error.reason);
            // affiche ce résultat mais route tout de même
            if (result.postExists)
                alert('Ce lien a déjà été utilisé');

            Router.go('postPage', {_id: result._id});
        });
    }
});

// Cette fonction utilise jQuery pour vérifier les valeurs de nos divers champs de formulaire
// et construire un nouvel objet post à partir des résultats.
// Nous devons nous assurer d'utiliser preventDefault sur l'argument event de notre gestionnaire
// pour être sûr que le navigateur n'essaie pas de prendre les devants en essayant d'envoyer
// le formulaire.

// Finalement, nous pouvons router l'utilisateur vers la page de son nouveau post.
// La fonction insert() (utilisée sur une collection), renvoie l’id généré pour l'objet
// qui vient d'être inséré dans la base de données.
// La fonction go() du Router va utiliser cet id pour construire l'URL correspondante,
// et nous amener sur la bonne page.

// -- POUR LES ERREURS --
Template.postSubmit.onCreated(function() {
    Session.set('postSubmitErrors', {});
});
Template.postSubmit.helpers({
    errorMessage: function(field) {
        return Session.get('postSubmitErrors')[field];
    },
    errorClass: function (field) {
        return !!Session.get('postSubmitErrors')[field] ? 'has-error' : '';
    }
});
// Nous utiliserons Session pour stocker un objet postSubmitErrors contenant
// tous les messages d'erreurs potentiels. Pendant que l'utilisateur interagit
// avec le formulaire, cet objet changera, ce qui, à son tour, mettra à jour
// activement la mise en page et le contenu du formulaire.
// En premier lieu, nous initialiserons l'objet à chaque fois que le template postSubmit
// est créé. Cela assure que l'utilisateur ne verra pas d'anciens messages d'erreur
// laissés par une précédente visite de cette page.
//
//     Nous définirons ensuite nos deux helpers de template. Ils regardent tous les deux la propriété field de Session.get('postSubmitErrors') (où field est soit url ou title selon le lieu d'où on appelle le helper).
//
// Alors que errorMessage renvoie simplement lui-même le message, errorClass vérifie la présence d'un message et renvoie has-error s'il en existe un.
// -- POUR LES ERREURS --


// La prochaine étape est de hooker cet objet de session postSubmitErrors au formulaire.
// Avant de faire ça, nous allons créer une nouvelle fonction validatePost dans posts.js
// qui regarde l'objet post, et renvoie un objet errors contenant toutes les erreurs pertinentes
// (à savoir, si les champs title ou url sont manquant) :
//
