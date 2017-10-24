var path = require('path');
var express = require('express');
var settings = require('./settings');
var models = require('../models/');

module.exports = function (app) {
/*    console.log(settings.path);
    app.use(express.static(path.join('./settings', 'public')));
    app.use(express.logger({format: 'dev'}));
    app.use(express.bodyParser());
    app.use(express.methodOverride());*/
    app.use(function (req, res, next) {
        models(function (err, db) {
            if (err) return next(err);

            req.models = db.models;
            req.db = db;

            return next();
        });
    });
        //app.use(app.router);
};