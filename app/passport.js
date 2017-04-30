const LocalStrategy = require('passport-local').Strategy;
const User = require('./models').User;

let loginStrategy = new LocalStrategy({
        usernameField: 'email', 
        passwordField: 'password', 
        passReqToCallback: true,
    }, 
    function(req, email, password, done) {
        User.findOne({ email : email }, function(err, user) {

            if (err) {
                console.log('login db error: ' + err);
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
);

const signupStrategy = new LocalStrategy({
        usernameField: 'email', 
        passwordField: 'password', 
        passReqToCallback: true,
    },
    function(req, email, password, done) {
        process.nextTick(() => {
            User.findOne({ email : email }, function(err, user) {
                if (err) {
                    console.log('signup db error: ' + err);
                    return done(err, false);
                }

                if (user) {
                    return done(null, false);
                } else {
                    let newUser = new User();
                    newUser.email = email;
                    newUser.password = password;
                    newUser.firstName = req.params['firstName'];
                    newUser.lastName = req.params['lastName'];

                    let userProfile = new Profile();
                    newUser.profile = userProfile;

                    newUser.save().then(
                        () => userProfile.save().then( 
                            () => done(null, newUser),
                            (err) => done(err, false)),
                        (err) => done(err, false));
                }
            });
        });
    }
);

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('login', loginStrategy);

    passport.use('signup', signupStrategy);
}