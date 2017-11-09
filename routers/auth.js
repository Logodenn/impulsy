const express = require('express');
const passport = require('passport'); 
const db = require('../models/controllers')

var router = express.Router();

//TODO : vérifier si l'user n'est pas déjà connecté 
router.get('/login', function(req, res) {
    res.render('login');
});

router.get('/signup', function(req, res) {
  res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
      successRedirect : '/', // redirect to the secure profile section
      failureRedirect : '/signup', // redirect back to the signup page if there is an error
      failureFlash : false // allow flash messages
    }));

router.post('/login', passport.authenticate('local-login', {
  successRedirect : '/', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : false // allow flash messages
}));

router.get('/logout',
function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;