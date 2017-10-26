/* UTILS */

require('dotenv').config()
const logger = require('./utils/logger')(module)
const environment = require('./models/config/environment')

/* NODE_MODULES */

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const app = express()
const http = require('http').Server(app)
const io = require('socket.io').listen(http)

/* GAME */

const game = require('./modules/game.js')

/* ROUTERS */

const mainRouter = require('./routers/main')
const gameRouter = require('./routers/game')
const authRouter = require('./routers/auth')
const dbRouter = require('./routers/db')
const userRouter = require('./routers/user')
const trackRouter = require('./routers/track')
const scoreRouter = require('./routers/score')

/* DB */

const db = require('./models/controllers')
environment(app)

/* PASSPORT SETUP */
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

passport.use('local-signin', new Strategy(
  (login, password, cb) => {
    // TODO : vérifier la méthode pour trouver un utiliseteur par son pseudo ou/et mail ?
    if (validateEmail(login)) email = true;
    else email = false;
    //db.user.getUser(login, email, function (err, result) {
    db.user.getUser(login, function (err, result) {
      if (err) {
        console.log(err);
        return cb(err);
      }
      console.log(result);
      if (!result) {
        return cb(null, false);
      }
      if (result.password !== password) { // TODO salt password with username/email   ?
        return cb(null, false);
      }
      console.log("Ok ! ");

      return cb(null, result);
    })
  }))

passport.use('local-signup', new Strategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField : 'mail',
  passwordField : 'password',
  passReqToCallback: true // allows us to pass back the entire request to the callback
},
function (req, email, password, cb) {
  var user = {
    pseudo : req.body.username, 
    mail : req.body.mail, 
    password : req.body.password, // TODO : salt password
    rank : -1
  }
  console.log(user);
  db.user.create(user, function (err, result) {
      // TODO : check if email / pseudo already use 
      if (err)
        throw err;
      return cb(null, user);
  });
}));



passport.serializeUser(function (user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) {
      return cb(err)
    }

    cb(null, user)
  })
})

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize())
app.use(passport.session())

/* MIDDLEWARES */

// Use application-level middleware for common functionality, including
app.use(require('cookie-parser')())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

app.set('view engine', 'hbs')

app.use(express.static(path.join(__dirname, '/assets')))

/* ROUTER SETUP */

app.use('/', mainRouter)
app.use('/game', gameRouter)
app.use('/db', dbRouter)
app.use('/user', userRouter)
app.use('/track', trackRouter)
app.use('/score', scoreRouter)
app.use('/', authRouter)

/* IO */

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
  logger.info('Connection of a client')

  game.initGame(io, socket)
})

module.exports = http