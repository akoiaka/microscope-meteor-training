// Collection Locale (client-seulement)
Errors = new Meteor.Collection(null);

// Maintenant que la collection a été créée, nous pouvons ajouter une fonction throwError
// que nous appellerons pour y ajouter des erreurs.
// Nous n'avons pas besoin de nous préoccuper de allow ou deny ou d'autre problème
// de sécurité puisque cette collection est “locale” à l'utilisateur en cours.

throwError = function(message) {
    Errors.insert({message: message});
};

// L'avantage d'utiliser une collection locale pour stocker les erreurs est que,
// comme toutes les collections, elle est réactive –
// cela veut dire que nous pouvons afficher les erreurs d'une manière réactive
// de la même façon que nous affichons les données de n'importe quelle autre collection.
// voir     {{> errors}} dans layout.html

// PUIS , créons les templates errors et error dans errors.html

// ENFIN Nous avons juste besoin d'intégrer notre helper de template,
// et nous seront fin prêts ! (voir errors.js dans includes/errors.js)
// Template.errors.helpers({
//     errors: function() {
//         return Errors.find();
//     }
// });



