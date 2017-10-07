Template.errors.helpers({
    errors: function() {
        return Errors.find();
    }
});

Template.error.onRendered(function() {
    var error = this.data;
    Meteor.setTimeout(function () {
        Errors.remove(error._id);
    }, 3000);
});
// Le callback onRendered est déclenché une fois notre template interprété dans le navigateur.
// À l'intérieur du callback, this se réfère à l'instance courante du template,
// et this.data nous permet d'accéder aux données de l'objet en cours d'interprétation
// (une erreur dans notre cas).