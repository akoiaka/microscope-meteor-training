/**
 * Created by akoi-aka on 01/09/2017.
 */
// var postsData = [
//     {
//         title: 'Facebook',
//         url: 'https://www.facebook.com/latourdeguettresques/'
//     },
//     {
//         title: 'Akoi',
//         url: 'http://www.akoi.fr'
//     },
//     {
//         title: 'La Tour de Guet',
//         url: 'http://tourdeguet.fr'
//     }
// ];
//
// Nous remplacerons simplement notre objet JavaScript statique postsData
// par une collection dynamique.
// En parlant de ça, vous êtes libres de supprimer le code postsData à partir d'ici.
// Voici à quoi devrait ressembler posts_list.js maintenant :

// FINALEMENT ON SUPPRIME LE HELPER CI-DESSOUS PARCE QUE PAS NECESSAIRE UNE FOIS LE CHAPITRE PAGINATION EFFECTUÉ
// - VOIR NOTES : PAGINATION
//
// Template.postsList.helpers({
//     // posts: postsData
//     // sort submitted -1 pour classer les posts avec tri croissant ou decroissant
//     posts: function() {
//         return Posts.find({}, {sort: {submitted: -1}});
//     }
// });
//
// Définir le helper de posts implique qu'il est maintenant disponible
// pour notre template, donc notre template sera capable de faire des itérations
// sur le tableau postsData, et d'envoyer chaque objet vers le template postItem.