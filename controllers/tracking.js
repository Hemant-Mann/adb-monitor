// models
var mongoose = require('../mongoose')();
var Stat = mongoose.model('Stat'),
    Code = mongoose.model('Stat'),
    Visitor = mongoose.model('Visitor'),
    User = mongoose.model('User');

var UAParser = require('ua-parser-js');

var Tracking = {
    validate: function (opts, req) {
        var self = this;
        opts.ti = Number(opts.ti);

        if (isNaN(opts.ti)) return false;

        Code.findOne({ _id: opts.cid }, function (err, code) {
            if (err || !code) return false;

            // check Host referer
            var host = (new Buffer(opts.host, 'base64')).toString('ascii');
            var ua = (new Buffer(opts.ua, 'base64')).toString('ascii');

            if (host != req.headers['host'] || ua != req.headers['user-agent']) return false;

            // Now check device
            User.findOne({ _id: code.user_id }, function (err, user) {
                if (!user) {
                    return self.process(true);
                }

                opts.params.cid = code._id;
                self.process(null, opts.params);
            });
        });
    },
    process: function (err, opts) {
    	
    }
};

var execute = function (req, res, next) {
    var params = req.query;
    Tracking.validate(params, req);
    next();
};

module.exports = execute;
