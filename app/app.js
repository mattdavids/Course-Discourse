const assert = require('assert');

/* Setup express */ 
const express = require('express');
const expressSession = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.static(__dirname + '/static'));   
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(expressSession({
    secret: 'mySecretKey',
    saveUninitialized: true,
    resave: true 
}));

/* Setup passport */
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

app.use(passport.initialize());
app.use(passport.session());

/* Setup Database */
const models = require('./models')
const User = models.User;
const Profile = models.Profile;
const Chat = models.Chat;
const Course = models.Course;
const Data = models.Data;

const url = 'mongodb://localhost:27017/course-discourse';
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/course-discourse')

const http = require('http').Server(app);


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

app.get('/data/:dataName', function(req, res) {
    let dataName = req.params['dataName'];
    Data.findOne({name : dataName}, function(err, data) {
        if (err) {
            res.statusCode = 500;
            return res.end();
        } 

        if (data === null) {
            res.statusCode = 404;
            return res.end(JSON.stringify({}));
        }

        res.statusCode = 200;
        res.end(JSON.stringify(data.values));
    });
})

app.get('/courses/:year/:season', function(req, res){
    let courseYear = req.params['year'];
    let courseSeason = req.params['season'];
    
    Course.find({ $and : [{ year : '' + courseYear}, { season : courseSeason}] }, 
                { _id : false }, 
                function (err, courses) {
        if (err) {
            res.statusCode = 500;
            return res.end();
        } 

        if (courses == null) {
            res.statusCode = 404;
            return res.end(JSON.stringify({}));
        }

        res.statusCode = 200;
        res.end(JSON.stringify(courses));
    })
})

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

app.post('/signup', passport.authenticate('signup', {
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

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});