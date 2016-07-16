var ejs = require('ejs'),
	fs = require('fs'),
	path = require('path'),
	templateDir = '../views/layouts/email-temp/';

var mailConfig = require('../config/mail');
var mailgun = require('mailgun-js')({apiKey: mailConfig.key, domain: mailConfig.domain });
var Utils = require('./util');

var Mail = {
	send: function (template, opts, cb) {
		template = template + '.ejs';

		var data = opts.data;
		delete opts.data;
		this._render(template, data, function (err, html) {
			if (err) return cb(err);

			opts.html = html;
			mailgun.messages().send(opts, function (error, body) {
		        if (error) {
		        	return cb(Utils.commonMsg(500));
		        }
		        cb(false, {message: data.message});    // only here process completes
		    });
		});
	},
	_render: function (template, d, cb) {
		if (!template) return "";
		var rendered;
		var file = path.join(__dirname, templateDir + template);

		fs.readFile(file, 'utf-8', function (err, data) {
			if (err) {
				return cb(Utils.commonMsg(500));
			}

			rendered = ejs.render(data, d);
			cb(null, rendered);
		});
	}
};

module.exports = Mail;