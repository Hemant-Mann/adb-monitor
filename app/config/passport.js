var mongoose = require('mongoose');

module.exports = function (passport) {
    var User = mongoose.model('User');
    
     // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    
    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findOne({
            _id: id
        }, '-password -salt', function (err, user) {
            done(err, user);
        });
    });

    require('./strategies/local')(passport);
};
