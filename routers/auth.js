var express = require('express');
var passport = require('passport'); 
const db = require('../models/controllers')

var router = express.Router();

//TODO : vérifier si l'user n'est pas déjà connecté 
router.get('/register', function(req, res) {
    res.render('register');
});

router.post('/register', function(req, res, next) {
  user = {
    pseudo : req.body.pseudo, 
    mail : req.body.mail, 
    password : req.body.password, // TODO : salt password
    rank : -1
  };
  db.user.create(user, function (err, result) {
    return res.render('register', { error : err.message });
    passport.authenticate('local', function(req, res) {
      res.redirect('/');
    });
  });
});

router.get('/login',
function(req, res){
  res.render('login');
});

router.post('/login', 
passport.authenticate('local', { failureRedirect: '/login' }),
function(req, res) {
  res.redirect('/');
});

router.get('/logout',
function(req, res){
  req.logout();
  res.redirect('/');
});



module.exports = router;