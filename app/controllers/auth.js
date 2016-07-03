var Shared = require('./controller');
var User = require('../models/user');
var Utils = require('../scripts/util');
var passport = require('passport');
var Meta = require('../models/meta');
var mailConfig = require('../config/mail');
var mailgun = require('mailgun-js')({apiKey: mailConfig.key, domain: mailConfig.domain });

/**
 * Auth Controller
 */
var Auth = (function () {
    'use strict';

    var controller = function Auth() {}

    // inherit Methods|Properties
    controller.prototype = new Shared;
    
    var a = new controller();
    a.defaultLayout = "layouts/client";
    a.register = function (req, res, cb) {
        this.view.message = null; this.view.user = null;
        if (req.method === 'POST') {
            if (req.body.password !== req.body.repeatPass) {
                return cb(new Error("Password's Don't Match"));
            }
            var user = new User(req.body);

            user.save(function (err, user) {
                if (err) {
                    return cb(err, user);
                }

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

                    var data = {
                        from: mailConfig.from,
                        to: user.email,
                        subject: 'Verify your Account',
                        text: 'Follow this link to verify your account <a href="/auth/verify/' + meta.val + '.html">Click Me</a>'
                    };

                    mailgun.messages().send(data, function (error, body) {
                        return cb({message: 'User registered successfully!'}, user);    
                    });
                });
                if (user) {
                    
                }
            });
            return;
        } else {
            cb();
        }
    };
    
    a.login = function (req, res, cb) {
        this.view.message = null; this.view.user = null;
        var self = this;

        if (req.method === 'POST') {
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    var err = new Error("Internal Server Error");
                    err.type = "json"; err.status = 500;
                    return cb(err);
                }

                if (!user) {
                    return cb(info);
                }
                if (!user.live) {
                    return cb({message: "User account not verified"});
                }

                req.login(user, function(err) {
                    if (err) return cb(err);

                    var url = '/platforms/index.html';
                    if (req.session.previousPath) {
                        url = req.session.previousPath
                        delete req.session.previousPath;
                    }
                    return res.redirect(url);
                });
            })(req, res);
        } else {
            cb();
        }
    };

    a.forgotPassword = function (req, res, cb) {
        this.view.message = null; this.view.user = null;
        cb(null);
    };

    a.verify = function (req, res, cb) {
        this.view.user = null;
        Meta.findOne({ prop: 'user', val: Utils.parseParam(req.params.id) }, function (err, meta) {
            if (err || !meta) {
                var err = new Error((Utils.commonMsg(400)).message);
                err.status = 400;
                return cb(err);
            }

            User.findOne({ _id: meta.pid }, function (err, user) {
                if (err) return false;

                user.live = true;
                user.save();
                meta.remove();
                return cb(Utils.commonMsg(200, "Account verified"));
            });
        });
    };
    
    a.logout = function (req, res, cb) {
        req.logout();
        res.redirect('/');
    };

    a.__class = controller.name.toLowerCase();
    return a;
}());

module.exports = Auth;
