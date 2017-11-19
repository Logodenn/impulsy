/* UTILS */

require('dotenv').config()
// const logger = require('./utils/logger')(module)
const environment = require('./models/config/environment')

/* NODE_MODULES */

const path = require('path')
const express = require('express')
const session = require('express-session')
const sessionStore = new session.MemoryStore()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const passportSocketIo = require('passport.socketio');
const app = express()
const http = require('http').Server(app)
const io = require('socket.io').listen(http)
const hbs = require('hbs')

/* ROOMS */

const RoomManager = require('./modules/RoomManager').getInstance(io)

/* ROUTERS */

const mainRouter = require('./routers/main')
const roomRouter = require('./routers/room.router')
const authRouter = require('./routers/auth')
const userRouter = require('./routers/user')
const trackRouter = require('./routers/track')
const scoreRouter = require('./routers/score')
const youtubeRouter = require('./routers/youtube')

/* DB */

const db = require('./models/controllers')
environment(app)

/* PASSPORT SETUP */

function validateEmail (email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

passport.use('local-login', new Strategy({
    // by default, local strategy uses username and password, we will override with email
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true // allows us to pass back the entire request to the callback
},
function (req, login, password, cb) {
  // try if it's an email or a username
  const email = validateEmail(login)
  db.user.getUser(login, email, function (err, result) {
    if (err) {
      console.log(err)
      return cb(err)
    }
    if (!result) {
      return cb(null, false)
    }
    if (result.password !== password) { // TODO salt password with username/email   ?
      return cb(null, false)
    }
    return cb(null, result)
  })
}))

passport.use('local-signup', new Strategy({
    // by default, local strategy uses username and password, we will override with email
  usernameField: 'mail',
  passwordField: 'password',
  passReqToCallback: true // allows us to pass back the entire request to the callback
},
function (req, email, password, cb) {
  var user = {
    pseudo: req.body.username,
    mail: req.body.mail,
    password: req.body.password, // TODO : salt password
    rank: -1
  }

  db.user.create(user, function (err, result) {
    // TODO : check if email / pseudo already use
    if (err) {
      throw err
    }
    return cb(null, user)
  })
}))

/* MIDDLEWARES */

// app.createServer( Cookies.express( keys ) )
// Use application-level middleware for common functionality, including
app.use(require('cookie-parser')())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(session({
  secret: 'keyboard cat',
  name: 'serializedUser',
  resave: true,
  store: sessionStore,
  saveUninitialized: true
}))

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize())
app.use(passport.session())

app.set('view engine', 'hbs')
hbs.registerPartials(path.join(__dirname, '/views/partials'))

app.use(express.static(path.join(__dirname, '/assets')))

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  db.user.getUserId(id, function (err, user) {
    done(err, user)
  })
})

io.use(passportSocketIo.authorize({
  key: 'serializedUser',
  secret: 'keyboard cat',
  passport: passport,
  store: sessionStore,
  cookieParser: cookieParser
}))

/* ROUTER SETUP */

app.use('/', mainRouter)
app.use('/room', roomRouter)
app.use('/user', userRouter)
app.use('/track', trackRouter)
app.use('/score', scoreRouter)
app.use('/youtube', youtubeRouter)
app.use('/', authRouter)

module.exports = http
