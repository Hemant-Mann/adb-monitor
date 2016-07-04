var mongoose = require('mongoose');
var config = require('./config');

// mongoose.connect('mongodb://' + config.user + ':' + config.pass + config.dburl + '/' + config.db);
module.exports = function () {
    var folder = './app/models/', dbURI;

    if (process.env.NODE_ENV === 'production') {
        dbURI = 'mongodb://' + config.user + ':' + config.pass + config.dburl + '/' + config.db;
    } else {
        dbURI = 'mongodb://localhost:27017/' + config.db;
    }
    var db = mongoose.connect(dbURI);

    // If the Node process ends, close the Mongoose connection 
    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });

    require(folder + 'stat');
    require(folder + 'code');
    require(folder + 'visitor');
    require(folder + 'user');
    return db;
};
