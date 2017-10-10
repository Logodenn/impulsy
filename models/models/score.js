var orm = require('orm');

module.exports = function (orm, db) {
    var Score = db.define("score", {
            date: { type: 'date', required: true, time: true},
            duration: { type: 'integer', required: true}
        },
        {
            validations: {
                date: orm.validators.unique()
            },
            methods: {
                serialize: function () {
                    return {
                        date: this.date,
                        duration: this.duration,
                        user_date:this.user_date,
                        track_date: this.track_date
                    }
                }
            }
        });

    console.log(db.settings);
    Score.hasOne('user', db.models.user,{
        type: 'text',
        required: true,
        reverse: 'pseudo',
        autoFetch: true,
    });
    Score.hasOne('track', db.models.track, {
        type: 'text',
        required: true,
        reverse: 'name',
        autoFetch: true

    });
};