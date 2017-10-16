//var orm = require("orm");


module.exports = function (orm, db) {
    var User = db.define('user', {
            pseudo: {type: 'text'},
            password: {type: 'text'},
            mail: {type: 'text'},
            rank: {type: 'integer'}
        },
        {
            validations: {
                pseudo: orm.validators.unique()
            },
            methods: {
                serialize: function () {
                    var scores;

                    if (this.scores) {
                        scores = this.scores.map(function (c) {
                            return c.serialize();
                        });
                    } else {
                        scores = [];
                    }

                    return {
                        pseudo: this.pseudo,
                        password: this.password,
                        mail: this.mail,
                        rank: this.rank,
                        scores: scores
                    };

                }
            }
        });

    User.hasMany('user', db.models.user, {link: String},{
        reverse: 'users',
        key: true
    });

};