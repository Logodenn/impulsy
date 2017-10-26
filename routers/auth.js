var express = require('express');
var passport = require('passport'); 
const db = require('../models/controllers')

var router = express.Router();

//TODO : vérifier si l'user n'est pas déjà connecté 
router.get('/register', function(req, res) {
    res.render('login');
});

router.post('/register', passport.authenticate('local-signup', {
      successRedirect : '/', // redirect to the secure profile section
      failureRedirect : '/login', // redirect back to the signup page if there is an error
      failureFlash : false // allow flash messages
    }));

router.get('/login',
function(req, res){
  res.render('login');
});

router.post('/login', 
passport.authenticate('local-signin', { failureRedirect: '/login' }),
function(req, res) {
  res.redirect('/');
});

router.get('/logout',
function(req, res){
  req.logout();
  res.redirect('/');
});



module.exports = router;