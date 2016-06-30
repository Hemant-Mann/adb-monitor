var mongoose = require('mongoose');
var config = require('./config');

// mongoose.connect('mongodb://' + config.user + ':' + config.pass + config.dburl + '/' + config.db);
module.exports = function () {
    var folder = './app/models/';
    var dbURI = 'mongodb://localhost:27017/' + config.db;
    var db = mongoose.connect(dbURI);

    mongoose.connection.on('connected', function () {
        console.log('Mongoose default connection open to ' + dbURI);
    });

    // If the connection throws an error
    mongoose.connection.on('error', function (err) {
        console.log('Mongoose default connection error: ' + err);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', function () {
        console.log('Mongoose default connection disconnected');
    });

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
