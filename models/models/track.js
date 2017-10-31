var orm = require("orm");

module.exports = function (orm, db) {
    var Track = db.define("track", {
            name: {type: 'text'},
            link: {type: 'text'},
            information: Object
        },
        {

            validations: {
                name: orm.validators.unique()
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
                        id : this.id,
                        name : this.name,
                        link: this.link,
                        difficulty : this.difficulty,
                        information: this.information,
                        scores: scores
                    };
                }
            }
        });
};