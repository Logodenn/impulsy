var orm = require('orm');

module.exports = function (orm, db) {
    var Score = db.define("score", {
            date: { type: 'date', required: true, time: true},
            duration: { type: 'integer', required: true}
        },
        {
            methods: {
                serialize: function () {
                    return {
                        id : this.id,
                        date: this.date,
                        duration: this.duration,
                        user_id: this.user_id,
                        track_id: this.track_id
                    }
                }
            }
        });

    Score.hasOne('user', db.models.user,{
        required: true,
        //reverse: 'pseudo',
        reverse: "scores",
        autoFetch: true
    });
    Score.hasOne('track', db.models.track,{
        required: true,
        //reverse: 'name',
        reverse : "scores",
        autoFetch: true
    });
};