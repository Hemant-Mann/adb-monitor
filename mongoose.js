var mongoose = require('mongoose');
var config = require('./config');

// mongoose.connect('mongodb://' + config.user + ':' + config.pass + config.dburl + '/' + config.db);
module.exports = function () {
	var folder = './models/';
    var db = mongoose.connect('mongodb://localhost:27017/' + config.db);
    
    require(folder + 'stat'),
    require(folder + 'code'),
	require(folder + 'visitor'),
	require(folder + 'user');
    return db;
};
