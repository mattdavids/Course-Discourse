/* 
 * Reference URLS: 
 * https://www.npmjs.com/package/connect-mongodb-session ~ Using MongoDBSessions
 * http://www.scotthasbrouck.com/blog/2016/3/18/passportjs-express-session-with-sockeio ~ Authenticating with socket.io and passport
 * https://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619 ~ General Authenticating with passport
 */

const dbURL = 'mongodb://localhost:27017/course-discourse';
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


/* Setup Sessions + Session Store */
const MongoDBStore = require('connect-mongodb-session')(expressSession);
const mongoStore = new MongoDBStore({
    uri: dbURL,
    collection: 'sessions'
});

mongoStore.on('error', function(error) {
    assert.ifError(error);
    assert.ok(false);
});

app.use(expressSession({
    secret: 'mySecretKey',
    store: mongoStore,
    cooke: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    saveUninitialized: true,
    resave: true,
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
const passportSocketIo = require('passport.socketio');
io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: 'mySecretKey',
  store: mongoStore,
  passport: passport,
  cookieParser: cookieParser,
}));

let chatAPI = require('./chat.js');
chatAPI.init(io);

/* Setup Mongoose */
const models = require('./models')
const User = models.User;
const Chat = models.Chat;
const Course = models.Course;
const Data = models.Data;

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(dbURL)

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
    failureRedirect : '/loginFailed',
}));

app.get('/loginFailed', function(req, res) {
    res.statusCode = 403;
    res.sendFile(__dirname + '/static/loginFailed.html');
});

app.post('/signup', passport.authenticate('signup', {
    successRedirect : '/home', 
    failureRedirect : '/signup',
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

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
    
    Course.find({ $and : [{ year : '' + courseYear}, { season : courseSeason}] }, function (err, courses) {
        respondWithCourses(res, err, courses);
    });
});

app.get('/courses/currentYear', function(req, res) {
    Course.find({ $and : [{ year : '2017'}, { season : 'fall'}]}, function(err, courses) {
        respondWithCourses(res, err, courses);
    });
})

app.get('/courses', function(req, res) {
    
    Course.find({}, function(err, courses) {
        respondWithCourses(res, err, courses);
    });
});

app.get('/coursesTaken', function(req, res) {
    if (!req.user) {
        res.end('{err : "You must be logged in"}');
    }
    
    let user = req.user;
    let ids = user.coursesTaken.map(function(item) {
        return item.course;
    });
    Course.find({_id : {$in : ids}}, function(err, courses) {
        respondWithCourses(res, err, courses);
    });
    
})

app.get('/recommended', function(req, res) {
    if (!req.user) {
        res.end('{err : "You must be logged in"}');
    }
    
    let user = req.user;
    if (user.majors.length === 0) {
        res.end(JSON.stringify({}));
        return;
    }
    
    let query = user.majors.map(function(major) {
        
        return {
            departmentName : {
                $regex : ".*" + major.replace(' major', '') + ".*",
            }
        }
    });
    
    user.minors.map(function(minor) {
        query.push({
            departmentName: {
                $regex : ".*" + minor.replace(' minor', '') + '.*',
            }
        });
    });

    Course.find({
        $and : 
            [{ year: '2017'},
            {season: 'fall'},
            {$or : query}
        ]}, function(err, courses) {
            respondWithCourses(res, err, courses);
        });

});

app.get('/match/:courseId', function(req, res) {
    let courseId = req.params['courseId'];
    Course.findById(courseId, function(err, course) {
        if (err) {
            return res.end('{err: "database error", msg : "' + err + '"}');
        }

        if (!course) {
            res.end('{err: "course not found"}');
        }

        Course.find({$and : [{_id: {$ne : courseId} }, {courseName: course.courseName}]}, function(err, courses) {
            if (err) {
                return res.end('{err: "database error", msg : "' + err + '"}');
            }

            if (!courses) {
                return res.end('{err: "course search failed"}');
            }

            let courseIds = courses.map((course) => course._id);
            User.find({$and: 
                       [
                           {_id : 
                            {$ne : req.user._id}
                           }, {coursesTaken: 
                               {$elemMatch: 
                                {course: 
                                 {$in : courseIds}}}}]}, function(err, users) {
                if (err) {
                    return res.end('{err: "database error", msg : "' + err + '"}');
                }

                if (!users) {
                    return res.end('{err: "user search failed"}');
                }

                if (users.length === 0) {
                    return res.end('{msg: "no other users found"}');
                }

                let matchListRating = users.map(function(user) {
                    return {
                        _id : user._id,
                        rating : getDistanceBetweenUsers(req.user, user),
                    }
                }).sort(function(a, b) {
                    return a.rating - b.rating;
                });
                
                User.findById(matchListRating[0]._id, function(err, match) {
                    if (err) {
                        return res.end('{err: "database error", msg : "' + err + '"}');
                    }
                    
                    let chat = new Chat();
                    chat.members = [req.user._id, match._id];
                    chat.topic = course.departmentCode + " " + course.courseNumber.slice(0, 3);

                    match.chats.push(chat);
                    req.user.chats.push(chat);

                    req.user.save();
                    match.save();
                    chat.save();
                    res.end(JSON.stringify(chat));
                    });
             });
        });
    })
});

function getDistanceBetweenUsers(user1, user2) {
    let result = 0;
    result += symmetricDifference(user1.interests, user2.interests).length;
    result += symmetricDifference(user1.clubs, user2.clubs).length;
    result += 10 * symmetricDifference(user1.majors, user2.majors).length;
    result += 5 * symmetricDifference(user1.minors, user2.minors).length;
    result += compareCourseLists(user1.coursesTaken, user2.coursesTaken);
    return result;
}

/*
http://stackoverflow.com/questions/1187518/javascript-array-difference
*/

function symmetricDifference(arr1, arr2) {
    let arr1Set = new Set(arr1);
    let arr2Set = new Set(arr2);
    
    return arr1.filter(function(x) {
        return !arr2Set.has(x);
    }).concat(arr2.filter(function(x) {
        return !arr1Set.has(x);
    }));
}

function compareCourseLists(courses1, courses2) {
    let result = 0;
    let sameCourses = [];
    
    let course1Map = courses1.map(function(course) {
        return course.course.courseName;
    });
    let course2Map = courses2.map(function(course) {
        return course.course.courseName;
    });
    
    for(let i = 0; i < course1Map.length; i ++) {
        let index = course2Map.indexOf(course1Map[i]);
        if (index > -1) {
            sameCourses.push(course1Map[i]);
            if (courses1[i].reason != courses2[index].reason) {
                result += 2;
            }
        } else {
            result += 4;
        }
    }
    
    for(let i = 0; i < course2Map.length; i ++) {
        let index = course1Map.indexOf(course2Map[i]);
        if (index > -1 && sameCourses.indexOf(course2Mapp[i]) < 0) {
            if (courses1[i].reason != courses2[index].reason) {
                result += 2;
            }
        } else {
            result += 4;
        }
    }
    return result;
    
}

function respondWithCourses(res, err, courses) {
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
}

app.get('/profile', function(req, res) {
    if (!req.user) {
        res.statusCode = 403;
        return res.end(JSON.stringify({error : 'You must be logged in'}));
    }

    User.findById(req.user._id)
        .populate('chats')
        .exec(function(err, user){
        if (err) {
            res.statusCode = 500;
            return res.end();
        }

        if (user === null) {
            res.statusCode = 404;
            return res.end(JSON.stringify({}));
        }
        
        res.statusCode = 200;
        res.end(JSON.stringify(user));
    });
});

app.post('/remove', function(req, res) {
   if (!req.user) {
       req.statusCode = 403;
       return res.end(JSON.stringify({error : 'You must be logged in'}));
   } 
    
    Chat.findByIdAndRemove(req.body.id, function(){}).remove();
    req.statusCode = 302;
    return res.end(JSON.stringify({successful: true}));

});

app.get('/checkUser/:email', function(req, res) {
    let email = req.params['email'];
    User.findOne({ email : email }, function(err, user) {

        if (err) {
            console.log('login db error: ' + err);
            res.end(JSON.stringify({validUser: false}));
        }

        if (!user) {
            res.end(JSON.stringify({validUser: true}));
        } else {
            res.end(JSON.stringify({validUser: false}));
        }

    });
});


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