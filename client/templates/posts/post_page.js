Template.postPage.helpers({
    comments: function() {
        return Comments.find({postId: this._id});
    }
});
// Nous insérons le bloc {{#each comments}} à l'intérieur du template de post,
// donc this est un post dans le helper comments. Pour trouver les commentaires pertinents,
// nous vérifions ceux qui sont liés à ce post via l'attribut postId.