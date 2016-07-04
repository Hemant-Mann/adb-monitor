var Meta = require('../models/meta');
var Mail = require('../scripts/mail');
var mailConfig = require('../config/mail');

var Auth = {
	register: function (user, cb) {
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
		    Mail.send('register', opts, cb);
		});
	}
}

module.exports = Auth;