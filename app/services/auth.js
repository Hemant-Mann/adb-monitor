var Meta = require('../models/meta');
var User = require('../models/user');
var Mail = require('../scripts/mail');
var Utils = require('../scripts/util');
var mailConfig = require('../config/mail');
var Subscription = require('../models/subscription');
var Plan = require('../models/plan');
var Invoice = require('../models/invoice');

var Auth = {
	register: function (user, planName, cb) {
		var self = this;
		User.findOne({ email: user.email }, function (err, u) {
			if (err || u) {
				return cb({ message: "Email already exists!!" });
			}

			user.save(function (err) {
				if (err) {
					return cb(err);
				}

				// Save a subscription an create an invoice on registration
				var regex = new RegExp('^' + planName + '$', "i");
				Plan.findOne({ name: regex }, function (err, plan) {
					if (err || !plan) {
						user.remove();
						return cb(new Error("Invalid Request"));
					}

					var start = new Date(); start.setHours(0, 0, 0, 0);
					var end = new Date(); end.setDate(end.getDate() + plan.period);
					end.setHours(23, 59, 59, 999);

					var sub = new Subscription({
						uid: user._id,
						plan: plan._id,
						start: start,
						end: end
					});
					sub.save();

					var invoice = new Invoice({
						uid: user._id,
						plan: plan._id,
						amount: plan.price,
						payid: ""
					});
					invoice.save();

					self._register(user, cb);
				});
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
		        domain: mailConfig.domain
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
	login: function () {

	}
}

module.exports = Auth;