//var orm = require("orm");


module.exports = function (orm, db) {
    var User = db.define('user', {
            pseudo: {type: 'text', key: true},
            password: String,
            rank: Number
        },
        {
            /*hooks: {
                beforeValidation: function () {
                    this.createdAt = new Date();
                }
            },
            validations: {
                title: [
                    orm.enforce.ranges.length(1, undefined, "must be atleast 1 letter long"),
                    orm.enforce.ranges.length(undefined, 96, "cannot be longer than 96 letters")
                ],
                body: [
                    orm.enforce.ranges.length(1, undefined, "must be atleast 1 letter long"),
                    orm.enforce.ranges.length(undefined, 32768, "cannot be longer than 32768 letters")
                ]
            },*/
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
                        rank: this.rank,
                        scores: scores
                    };
                }
            }
        });
};