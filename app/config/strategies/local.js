var LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User');

module.exports = function (passport) {
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {

        User.findOne({ email: email }, function (err, user) {
            if (err) return done(err);

            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }

            if (!user.authenticate(password)) {
                return done(null, false, {
                    message: 'Invalid password'
                });
            }

            // all is well
            return done(null, user);
        });
    }));
};
