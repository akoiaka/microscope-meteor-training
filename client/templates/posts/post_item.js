/**
 * Created by akoi-aka on 01/09/2017.
 */
Template.postItem.helpers({
    ownPost: function() {
        return this.userId === Meteor.userId();
    },
    domain: function() {
        var a = document.createElement('a');
        a.href = this.url;
        return a.hostname;
    },
    // ,
    // commentsCount: function() {
    //     return Comments.find({postId: this._id}).count();
    // }
    upvotedClass: function() {
        var userId = Meteor.userId();
        if (userId && !_.include(this.upvoters, userId)) {
            return 'btn-primary upvotable';
        } else {
            return 'disabled';
        }
    }
});

Template.postItem.events({
    // 'click .upvote': function(e) {
    'click .upvotable': function(e) {
        e.preventDefault();
        Meteor.call('upvote', this._id);
    }
});