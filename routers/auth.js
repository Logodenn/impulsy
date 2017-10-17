var express = require('express');
var passport = require('passport'); 
// TODO vérifier import pour User
var User = require('../models/controllers/user_controller');

var router = express.Router();

//TODO : vérifier si l'user n'est pas déjà connecté 
router.get('/register', function(req, res) {
    res.render('register');
});

//TODO : 
// Faire un create sur User
// Salé le mdp 
router.post('/register', function(req, res, next) {
  User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
    if (err) {
      return res.render('register', { error : err.message });
    }
    passport.authenticate('local', function(req, res) {
      res.redirect('/');
    });
  });
});

app.get('/login',
function(req, res){
  res.render('login');
});

app.post('/login', 
passport.authenticate('local', { failureRedirect: '/login' }),
function(req, res) {
  res.redirect('/');
});

app.get('/logout',
function(req, res){
  req.logout();
  res.redirect('/');
});



module.exports = router;