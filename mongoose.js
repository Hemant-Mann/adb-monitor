var mongoose = require('mongoose');
var config = require('./config');

module.exports = function (env) {
    var folder = './app/models/', dbURI;

    if (env === 'production') {
        dbURI = 'mongodb://' + config.user + ':' + config.pass + config.dburl + '/' + config.db;
    } else {
        dbURI = 'mongodb://localhost:27017/' + config.db;
    }
    var db = mongoose.connect(dbURI);

    require(folder + 'stat');
    require(folder + 'platform');
    require(folder + 'visitor');
    require(folder + 'user');
    return db;
};
