/*

var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
 
// These are the new imports we're adding:
var passport = require('passport');
var StormpathStrategy = require('passport-stormpath');
var session = require('express-session');
var flash = require('connect-flash'); // peut être inutile 

// j'ai un doute sur l'utilisation de passport 
// mais ça pertmet d'utiliser FB, Google etc... 


// Here is what we're adding:
var strategy = new StormpathStrategy();
passport.use(strategy);
passport.serializeUser(strategy.serializeUser);
passport.deserializeUser(strategy.deserializeUser);


app.use(favicon()); // je ne sais pas ce que ça fait
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
 
// Stuff we're adding:
app.use(session({
  secret: process.env.EXPRESS_SECRET,
  key: 'sid',
  cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


*/
// Render the registration page.
router.get('/register', function(req, res) {
  res.render('register', { title: 'Register', error: req.flash('error')[0] });
});
 
// Register a new user to Stormpath.
router.post('/register', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
 
  // Grab user fields.
  if (!username || !password) {
    return res.render('register', { title: 'Register', error: 'Email and password required.' });
  }
 
  // Initialize our Stormpath client.
  var apiKey = new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  );
  var spClient = new stormpath.Client({ apiKey: apiKey });
 
  // Grab our app, then attempt to create this user's account.
  spClient.getApplication(process.env['STORMPATH_APP_HREF'], function(err, app) {
    if (err) throw err;
 
    app.createAccount({
      username: username,
      email: email,
      password: password
    }, function (err, createdAccount) {
      if (err) {
        return res.render('register', {title: 'Register', error: err.userMessage});
      }
 
      passport.authenticate('stormpath')(req, res, function () {
        return res.redirect('/dashboard');
      });
    });
  });
});