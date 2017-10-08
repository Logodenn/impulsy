var orm = require('orm');

module.exports = function (orm, db) {
    var Score = db.define("score", {
            date: { type: 'date', required: true, time: true, key:true},
            duration: { type: 'number', required: true}
        },
        {
            methods: {
                serialize: function () {
                    return {
                        date: this.date,
                        duration: this.duration
                    }
                }
            }
        });

    console.log(db.settings);
    Score.hasOne('user', db.models.user,{
        required: true,
        reverse: 'user',
        autoFetch: true,
        type: 'text'
    });
    Score.hasOne('track', db.models.track, {
        required: true,
        //reverse: 'track',
        autoFetch: true,
        type: 'text'
    });
};