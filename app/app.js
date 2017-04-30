const assert = require('assert');

/* Setup express */ 
const express = require('express');
const expressSession = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
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
app.use(passport.initialize());
app.use(passport.session());
require('./passport.js')(passport);


/* Setup Server */
const server = require('http').Server(app);

/* Setup Socket.io */
const io = require('socket.io')(server);

/* Setup Mongoose */
const models = require('./models')
const User = models.User;
const Profile = models.Profile;
const Chat = models.Chat;
const Course = models.Course;
const Data = models.Data;

const url = 'mongodb://localhost:27017/course-discourse';
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/course-discourse')

// Home page
app.get('/', function(req, res) {
    if (req.user) {
        res.redirect('/home');
    } else {
        res.sendFile(__dirname + '/static/index.html');
    }
});

// Login page
app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/static/login.html');
});

// Signup page
app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/static/signUp.html');
});

// Main App
app.get('/home*', (req, res) => {
    if (req.user) {
        res.sendFile(__dirname + '/static/findClasses.html');
    } else {
        res.redirect('/');
    }
});


// Login/Signup posts
app.post('/login', passport.authenticate('login', {
    successRedirect : '/home',
    failureRedirect : '/login',
}));

app.post('/signup', passport.authenticate('signup', {
    successRedirect : '/home', 
    failureRedirect : '/signup',
}));


// API calls
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
    });
})

app.get('/profile', function(req, res) {
    if (!req.user) {
        res.statusCode = 403;
        return res.end(JSON.stringify({error : 'You must be logged in'}));
    }

    Profile.findOne({ _id : req.user.profile }, {_id : false}, function(err, profile) {
        if (err) {
            res.statusCode = 500;
            return res.end();
        }

        if (profile === null) {
            res.statusCode = 404;
            return res.end(JSON.stringify({}));
        }

        res.statusCode = 200;
        res.end(JSON.stringify(profile));
    });
})

app.use(express.static(__dirname + '/static'));   

server.listen(3000, function() {
   console.log('listening on *:3000'); 
});

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});