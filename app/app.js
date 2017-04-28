const express = require('express');
const expressSession = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongo = require('mongodb');
const assert = require('assert');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const MongoClient = mongo.MongoClient;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/course-discourse')

const models = require('./models')
const User = models.User;
const Chat = models.Chat;
const Class = models.Class;

const app = express();

app.use(express.static(__dirname + '/static'));   
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(expressSession({
    secret: 'mySecretKey',
    saveUninitialized: true,
    resave: true 
}));

app.use(passport.initialize());
app.use(passport.session());


const http = require('http').Server(app);

// Connection URL
const url = 'mongodb://localhost:27017/course-discourse';

passport.use('login', new LocalStrategy({
        usernameField: 'email', 
        passwordField: 'password', 
        passReqToCallback: true,
    },
    function(req, email, password, done) {
        User.findOne({ email : email }, function(err, user) {
            console.log('err: ' + err);

            if (err) {
                return done(err);
            }

            if (!user) {
                console.log('Unable to login with email: ' + email);
                console.log('User not found.');
                return done(null, false, { message: 'incorrect user' });
            }

            if (user.password !== password) {
                console.log('Unable to login with email: ' + email);
                console.log('Incorrect password.');
                return done(null, false, { message: 'incorrect password' });
            }

            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('signup', new LocalStrategy({
        usernameField: 'email', 
        passwordField: 'password', 
        passReqToCallback: true,
    },
    function(req, email, password, done) {

    }
));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/static/signUp.html');
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/static/login.html');
});

app.post('/login', passport.authenticate('login', {
    successRedirect : '/dog',
    failureRedirect : '/cat',
}))

app.get('/dog', function(req, res) {
    if (req.user === undefined) {
        //not logged in
    } else {
        //is logged in
    }
    res.end('cat ' + req.user);
})

app.get('/cat', function(req, res) {
    console.log('ffffail');
    
    res.end('dog');
})


app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/static/findClasses.html');
});




http.listen(3000, function() {
   console.log('listening on *:3000'); 
});