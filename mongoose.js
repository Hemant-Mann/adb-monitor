var mongoose = require('mongoose');
var config = require('./config');

module.exports = function (env) {
    var folder = './app/models/', dbURI;

    if (env === 'production') {
        dbURI = 'mongodb://' + config.user + ':' + config.pass + config.dburl + '/' + config.db;
    } else {
        dbURI = 'mongodb://localhost:27017/' + config.db;
    }
    var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
    var db = mongoose.connect(dbURI, options);

    require(folder + 'user');
    return db;
};
