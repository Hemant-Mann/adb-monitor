var Meta = require('../models/meta');
var User = require('../models/user');
var Mail = require('../scripts/mail');
var Utils = require('../scripts/util');
var mailConfig = require('../config/mail');
var Invoice = require('../models/invoice');

var Auth = {
	register: function (user, cb) {
		var self = this;
		User.findOne({ email: user.email }, function (err, u) {
			if (err || u) {
				return cb({ message: "Email already exists!!" });
			}

			user.credits = 10000;
			user.save(function (err) {
				if (err) return cb(err);
				
				var invoice = new Invoice({
					uid: user._id,
					amount: "0.00",
					visitors: 10000,
					payid: "PAYPAL_ID",
					live: true
				});
				invoice.save();

				self._register(user, cb);
			});
		});
	},
	_register: function (user, cb) {
		var meta = new Meta({
		    prop: 'user',
		    pid: user._id,
		    val: (Math.random() * 1e32).toString(36)
		});
		
		meta.save(function (err, meta) {
		    if (err) {
		        return cb(Utils.commonMsg(500));
		    }

		    var opts = {
		        from: mailConfig.from,
		        to: user.email,
		        subject: 'Verify your Account'
		    };

		    opts.data = {
		        user: user,
		        code: meta.val,
		        platform: mailConfig.platform,
		        domain: mailConfig.domain,
		        message: "Check your email for account verification"
		    };
		    Mail.send('register', opts, function (err, success) {
		    	if (err) {
		    		user.remove(); meta.remove();
		    		return cb(err);
		    	}
		    	cb(success);
		    });
		});
	},
	forgotPass: function (user, meta, cb) {
        meta.save(function (err) {
            if (err) return Utils.commonMsg(500);

            var opts = {
            	from: mailConfig.from,
            	to: user.email,
            	subject: 'Reset your password'
            };

            opts.data = {
            	user: user,
            	meta: meta,
            	platform: mailConfig.platform,
		        domain: mailConfig.domain,
		        message: "Check your email for further instructions"
            };
            Mail.send('forgotpass', opts, function (err, success) {
            	if (err) {
            		meta.remove();
            		return cb(err);
            	}
            	cb(success);
            });
        });
    }
}

module.exports = Auth;