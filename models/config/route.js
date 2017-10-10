var controllers = require('../controllers')

module.exports = function (app) {
    //app.get( '/'                           , controllers.home);

    app.post('/db'       ,controllers.db.clean);

    //app.get( '/user'                   , controllers.user.list);
    app.post('/user/:pseudo/:password/:rank'                   , controllers.user.create);

    app.get( '/track'                   , controllers.track.list);
    app.post('/track/:name/:link'                   , controllers.track.create);

    //app.get( '/score'                   , controllers.score.list);
    app.post('/score/:duration/:user_id/:track_id'                   , controllers.score.create);

    /*app.get( '/message/:id'                , controllers.messages.get);
    app.post('/message/:messageId/comments', controllers.comments.create);*/
};