

module.exports = function (orm, db) {
    var User = db.define('user', {
            pseudo: {type: 'text'},
            password: {type: 'text'},
            mail: {type: 'text'},
            rank: {type: 'integer'}
        },
        {
            validations: {
                pseudo: orm.validators.unique(),
                mail: orm.validators.unique()
            },
            methods: {
                serialize: function () {
                    var scores;
                    var friends;
                    var favoriteTracks;

                    if (this.scores) {
                        scores = this.scores.map(function (c) {
                            return c.serialize();
                        });
                    } else {
                        scores = [];
                    }

                    if (this.friends) {
                        friends = this.friends.map(function (c) {
                            return c.serialize();
                        });
                    } else {
                        friends = [];
                    }

                    if (this.favoriteTracks) {
                        favoriteTracks = this.favoriteTracks.map(function (c) {
                            return c.serialize();
                        });
                    } else {
                        favoriteTracks = [];
                    }

                    return {
                        id: this.id,
                        pseudo: this.pseudo,
                        password: this.password,
                        mail: this.mail,
                        rank: this.rank,
                        scores: scores,
                        friends: friends,
                        favoriteTracks: favoriteTracks
                    };

                }
            }
        });

    User.hasMany('friends', db.models.user, {}, {
        reverse: "users",
        autoFetch: true,
        key: true,
    });

    User.hasMany('favoriteTracks', db.models.track, {}, {
        reverse: "favoriteTracks",
        autoFetch: true,
        key: true,
    });
/*    User.hasMany("friends", {
        reverse: 'users',
        key       : true, // Turns the foreign keys in the join table into a composite key
        autoFetch : true
    });*/
};