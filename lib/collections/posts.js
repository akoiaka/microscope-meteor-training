Posts = new Mongo.Collection('posts');

// -- POUR LES ERREURS --
validatePost = function (post) {
    var errors = {};
    if (!post.title)
        errors.title = "Please fill in a headline";
    if (!post.url)
        errors.url = "Please fill in a URL";
    return errors;
}
// -- POUR LES ERREURS --


// Notre helper {{#each}} a itéré sur tous nos Posts, et les a affiché à l'écran.
// La collection côté serveur a récupéré les articles de Mongo,
// les a envoyés vers la collection côté client,
// et nos helpers Spacebars les ont affichés dans notre template.
//


// Nous allons profiter de cette opportunité pour sécuriser notre méthode un peu plus
// en utilisant le paquet audit-argument-checks.
//     Ce paquet vous permet de tester n'importe quel objet JavaScript
// selon un schéma prédéfini. Dans notre cas, nous l'utiliserons pour
// tester que l'utilisateur qui utilise la méthode est bien authentifié
// (en nous assurant que Meteor.userId() est une chaîne (String),
// et que l'objet postAttributes passé en tant qu'argument à la méthode contient
// les chaînes title et url, pour ne pas nous retrouver à entrer des morceaux aléatoires
// de données dans notre base de données.
//
// Définissons donc la méthode postInsert dans notre fichier collections/posts.js.
// Nous supprimerons le bloc allow() de posts.js puisque de toute façon
// les méthodes Meteor les ignorent.
// Posts.allow({
//     insert: function(userId, doc) {
//         // autoriser les posts seulement si l'utilisateur est authentifié
//         return !! userId;
//     }
// });

// maintenant que nous éditons et supprimons des posts depuis le client,
// retournons dans le fichier posts.js et rajoutons la fameuse méthode allow() :
//
Posts.allow({
    update: function(userId, post) { return ownsDocument(userId, post); },
    remove: function(userId, post) { return ownsDocument(userId, post); },
});
//  Nous allons ensuite étendre (extend) l'objet postAttributes avec
// trois nouvelles propriétés : l’_id et le nom (username) de l'utilisateur,
// ainsi que l'horodatage du post soumis (submitted),
// avant d'insérer le tout dans notre base de donnée et de retourner l’_id final
// au client (en d'autres mots, celui à l'origine de l'appel de cette méthode)
// dans un objet JavaScript.
// Notez que la méthode _.extend() fait partie de la librairie Underscore,
// et qu'elle vous permet simplement d’“étendre” un objet avec les propriétés d'un autre.

// Ce n'est pas parce que vous pouvez éditer vos propres posts que vous devez être capable
// d'éditer toutes les propriétés. Par exemple, nous ne voulons
// pas que l'utilisateur crée un post et l'assigne à quelqu'un d'autre.
// Donc nous allons utiliser le callback deny() pour permettre à l'utilisateur d'éditer
// seulement certains champs :

// -- ERREURS --
Posts.deny({
    update: function(userId, post, fieldNames, modifier) {
        // update: function(userId, post, fieldNames) {
        // may only edit the following two fields
        var errors = validatePost(modifier.$set);
        // Tout comme nous avons fait pour le formulaire de soumission de post,
        // nous voulons aussi valider nos posts côté serveur.
        // À part, rappelez-vous, que nous n'utilisons pas de méthode
        // pour éditer les posts. mais un appel direct à update depuis le client.
        // Cela signifie que nous devrons ajouter un nouveau callback deny à la place :

        // return (_.without(fieldNames, 'url', 'title').length > 0);

        return errors.title || errors.url;

    }
});
// Notez que l'argument post se réfère au post existant.
// Dans ce cas, nous voulons valider la mise à jour,
// ce pourquoi nous appelons validatePost sur le contenu de la propriété $set
// de modifier (comme dans Posts.update({$set: {title: ..., url: ...}})).
// Cela fonctionne parce que modifier.$set contient les deux mêmes propriétés title
// et url que l'objet post en entier. Bien sûr, cela signifie que n'importe quelle
// mise à jour partielle qui concerne seulement title ou url ne fonctionnera pas,
// mais en pratique ça ne devrait pas être un problème.
// Vous remarquerez peut-être que c'est notre second callback deny.
// Lorsqu'on ajoute de multiples callbacks deny, l'opération échouera
// si l'un d'entre eux renvoie true.
// Dans ce cas, cela veut dire que update ne fonctionnera que s'il cible seulement
// les champs title et url, ou si aucun des deux n'est vide.
// -- ERREURS --

// Nous transmettons le tableau fieldNames qui contient la liste des champs modifiés
// et en utilisant la fonction without() d’Underscore nous obtenons un tableau
// qui contient les champs qui ne sont pas url ou title.
// Si tout se passe bien, le tableau sera vide et sa taille devra être de 0.
// Si quelqu'un essaie de jouer un peu avec le code, la taille du tableau vaudra 1 ou plus,
// et le callback retournera true (ce qui empêchera la mise à jour).


Meteor.methods({
    postInsert: function(postAttributes) {
        check(Meteor.userId(), String);
        check(postAttributes, {
            title: String,
            url: String
        });

        // // COMPENSATION DE LA LATENCE
        // if (Meteor.isServer) {
        //     postAttributes.title += postAttributes.title + "(server)";
        //     // attente de 5 secondes
        //     Meteor._sleepForMs(5000);
        // } else {
        //     postAttributes.title += "(client)";
        // }

        // -- POUR LES ERREURS --
        // quelqu'un pourrait toujours essayer d'entrer un post vide manuellement
        // en appelant la méthode postInsert depuis la console du navigateur.
        // Même si nous n'avons pas besoin d'afficher de messages d'erreur
        // sur le serveur, nous pouvons toujours utiliser la même fonction validatePost. Sauf que cette fois, nous l'appellerons aussi depuis l'intérieur de la méthode, pas seulement depuis le helper d'événement :
        var errors = validatePost(postAttributes);
        if (errors.title || errors.url)
            throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");
        // -- POUR LES ERREURS --

        // CI DESSOUS POUR EVITER LES DOUBLONS
        // Si un post avec la même url a déjà été créé auparavant,
        // nous n'ajouterons pas le lien une nouvelle fois, mais au lieu de cela
        // nous allons rediriger l'utilisateur vers ce post.
        var postWithSameLink = Posts.findOne({url: postAttributes.url});
        if (postWithSameLink) {
            return {
                postExists: true,
                _id: postWithSameLink._id
            }
        }
        // Nous cherchons dans notre base de données un post avec la même url.
        // Si nous en trouvons un, nous retournons (return) l’_id de ce posts
        // avec la propriété postExists:true pour informer le client de ce cette situation
        // particulière.
        // Et puisque nous déclenchons un appel à return, la méthode s'interrompt à ce moment
        // sans exécuter la déclaration insert, évitant ainsi avec élégance de créer des doublons.

        var user = Meteor.user();
        var post = _.extend(postAttributes, {
            userId: user._id,
            author: user.username,
            submitted: new Date(),
            commentsCount: 0,
            upvoters: [],
            votes: 0
        });

        var postId = Posts.insert(post);
        return {
            _id: postId
        };
    },
    upvote: function(postId) {
        check(this.userId, String);
        check(postId, String);
        // var post = Posts.findOne(postId);
        // if (!post)
        //     throw new Meteor.Error('invalid', 'Post not found');
        // if (_.include(post.upvoters, this.userId))
        //     throw new Meteor.Error('invalid', 'Already upvoted this post');
        // Posts.update(post._id, {
        var affected = Posts.update({
            _id: postId,
            upvoters: {$ne: this.userId}
        }, {
            $addToSet: {upvoters: this.userId},
            $inc: {votes: 1}
        });
        if (! affected)
            throw new Meteor.Error('invalid', "Vous n'avez pas pu voter pour ce post.");
    }
});

