var Meta = require('../models/meta');
var User = require('../models/user');
var Mail = require('../scripts/mail');
var mailConfig = require('../config/mail');

var Auth = {
	register: function (user, cb) {
		var self = this;
		User.findOne({ email: user.email }, function (err, u) {
			if (err || u) {
				return cb({ message: "Email already exists!!" });
			}

			user.save(function (err) {
				if (err) {
					return cb(err);
				}

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
		        user.remove();
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