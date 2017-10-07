Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    waitOn: function() {
        // return [Meteor.subscribe('posts'), Meteor.subscribe('comments')];
        // return [Meteor.subscribe('posts'), Meteor.subscribe('notifications')]
// PAGINATION
//         Premièrement, nous arrêterons l'abonnement à la publication
// posts dans le bloc Routeur.configure().
// Supprimez juste Meteor.suscribe('posts'),
// en laissant seulement l'abonnement aux notifications :

        return [Meteor.subscribe('notifications')]

    }
});
//
// Router.route('/posts/:_id', {
//     name: 'postPage',
//     waitOn: function() {
//         //     return Meteor.subscribe('comments', this.params._id);
//         // },
//         return [
//             Meteor.subscribe('singlePost', this.params._id),
//             Meteor.subscribe('comments', this.params._id)
//         ];
//     },
//     data: function() { return Posts.findOne(this.params._id); }
// });
// Router.route('/posts/:_id/edit', {
//     name: 'postEdit',
//     data: function() { return Posts.findOne(this.params._id); }
// });
//
// Router.route('/submit', {name: 'postSubmit'});

PostsListController = RouteController.extend({
    template: 'postsList',
    increment: 5,
    postsLimit: function() {
        return parseInt(this.params.postsLimit) || this.increment;
    },
    findOptions: function() {
        // return {sort: {submitted: -1}, limit: this.postsLimit()};
        return {sort: this.sort, limit: this.postsLimit()};
    },
    // FINALEMENT ON ENLEVE LE WAIT ON POUR NE PAS AVOIR DE CHARGEMENT INTEMPESTIF
    // DE DEBUT DE PAGE TOUT LE TEMPS QUAND ON VEUT LIRE PLUS D ARTICLES
    // waitOn: function() {
    //     return Meteor.subscribe('posts', this.findOptions());
    // },
    subscriptions: function() {
        this.postsSub = Meteor.subscribe('posts', this.findOptions());
    },
    // data: function() {
    //     return {posts: Posts.find({}, this.findOptions())};
    // }
    posts: function() {
        return Posts.find({}, this.findOptions());
    },
    data: function() {
        var hasMore = this.posts().count() === this.postsLimit();
        // var nextPath = this.route.path({postsLimit: this.postsLimit() + this.increment});
        return {
            posts: this.posts(),
            ready: this.postsSub.ready,
            // nextPath: hasMore ? nextPath : null
            nextPath: hasMore ? this.nextPath() : null
        };
    }
});

// Nous ajouterons un paramètre postsLimit au chemin de la route.
// Ajouter un ? après le nom du paramètre signifie que c'est optionnel.
// Donc cette route ne correspondra pas seulement à http://localhost:3000/50,
// mais également au simple et ancien http://localhost:3000.
// Router.route('/', {name: 'postsList'});
//
// Router.route('/:postsLimit?', {
//     name: 'postsList',

// C'est important de noter qu'un chemin de la forme /:parameter?
// correspondra à tous les chemins possibles.
// Chaque route sera analysée successivement pour voir si elle correspond
// avec le chemin courant, nous avons besoin de nous assurer que nous organisons
// // nos routes dans un ordre de spécificité décroissante.
// En d'autres mots, les routes qui ciblent des routes plus spécifiques
// comme /posts/:_id viendraient en première, et notre route postsList
// serait déplacée en bas du groupe de routes vu qu'elle
// correspond pratiquement avec tout.

NewPostsController = PostsListController.extend({
    sort: {submitted: -1, _id: -1},
    nextPath: function() {
        return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment})
    }
});

BestPostsController = PostsListController.extend({
    sort: {votes: -1, submitted: -1, _id: -1},
    nextPath: function() {
        return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment})
    }
});

Router.route('/', {
    name: 'home',
    controller: NewPostsController
});
Router.route('/new/:postsLimit?', {name: 'newPosts'});
Router.route('/best/:postsLimit?', {name: 'bestPosts'});

Router.route('/posts/:_id', {
    name: 'postPage',
    waitOn: function() {
        return [
            Meteor.subscribe('singlePost', this.params._id),
            Meteor.subscribe('comments', this.params._id)
        ];
    },
    data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/posts/:_id/edit', {
    name: 'postEdit',
    waitOn: function() {
        return Meteor.subscribe('singlePost', this.params._id);
    },
    data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/submit', {name: 'postSubmit'});
//

 //
 // -- OLD --

// Il est maintenant temps d'aborder le dur problème de s'abonner
// et trouver les bonnes données. Nous avons besoin de gérer le cas où
// le paramètre postsLimit n'est pas présent, donc nous l'assignerons
// à une valeur par défaut. Nous utiliserons “5” pour nous donner
// vraiment assez de place pour jouer avec les paginations.


//
//     waitOn: function() {
//         var limit = parseInt(this.params.postsLimit) || 5;
//         return Meteor.subscribe('posts', {sort: {submitted: -1}, limit: limit});
//     },
//     // AJOUT
//     data: function() {
//         var limit = parseInt(this.params.postsLimit) || 5;
//         return {
//             posts: Posts.find({}, {sort: {submitted: -1}, limit: limit})
//         };
//     }
// });

// Vous noterez que nous passons maintenant un objet JavaScript
// ({sort: {submitted: -1}, limit: postsLimit}) avec le nom de notre
// publication posts. Cet objet servira au même titre que le paramètre
// options pour l'expression de Posts.find() côté serveur.
// Faisons quelques modifications dans notre code côté serveur
// pour implémenter ça (VOIR DANS SERVER/PUBLICATIONS.JS)

// Et puisque que nous avons mis le contexte de données au niveau des routes,
// nous pouvons maintenant nous débarrasser sans problème du template helper
// posts dans le fichier posts_list.js et supprimer le contenu de ce fichier.
//
// Nous avons nommé notre contexte de données posts (le même nom que le helper),
// donc nous n'avons même pas besoin de toucher au template postsList !


var requireLogin = function() {
    if (! Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        this.next();
    }
}
// Pour tester notre nouvelle page d'erreur, vous pouvez essayer d'accéder à une url quelconque
// comme http://localhost:3000/rien-par-ici.
//     Un instant ; que se passe-t-il si quelqu'un entre une url de la forme
// http://localhost:3000/posts/xyz, où xyz n’estpas un _id valide d'article ?
// C'est toujours une route valide, mais elle ne mène à aucune donnée.
// Heureusement, Iron Router est assez intelligent pour gérer cela,
// il suffit d'ajouter un hook spécial dataNotFound à la fin de router.js :
Router.onBeforeAction('dataNotFound', {only: 'postPage'});
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
