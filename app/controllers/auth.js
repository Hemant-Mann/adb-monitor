var Shared = require('./controller');
var User = require('../models/user');
var Meta = require('../models/meta');

var passport = require('passport');
var Utils = require('../scripts/util');
var AuthService = require('../services/auth');
var config = require('../config/mail');

/**
 * Auth Controller
 */
var Auth = (function () {
    'use strict';

    var a = Utils.inherit(Shared, 'Auth');
    a.beforeSession = ['login', 'register', 'forgotPassword', 'resetPassword', 'verify'];

    /**
     * If session is initialized for the user then don't let him visit beforeSession URLs
     * Acts as a middleware
     * @param  {Object} req Express Request Object
     * @return {Boolean}
     */
    a._session = function (req, res, next) {
        var re = new RegExp(a.beforeSession.join('|'));
        if (req.user && req.url.match(re)) {
            return res.redirect('/dashboard.html');
        }
        next();
    };

    a._initView = function () {
        this.parent._initView.call(this);
        this.view.message = null;
        this.defaultLayout = "layouts/client";
    };

    a.register = function (req, res, cb) {
        this.view.errors = {}; var self = this;
        this.seo.title = "Register | " + config.platform;

        if (req.method === 'POST') {
            if (req.body.password !== req.body.repeatPass) {
                return cb({message: "Password's Don't Match"});
            }
            var user = new User(req.body);

            AuthService.register(user, function (err) {
                if (err.errors) {
                    self.view.errors = err.errors;
                }
                return cb({message: err.message});
            });
        } else {
            cb();
        }
    };
    
    a.login = function (req, res, cb) {
        var self = this;
        this.seo.title = "Login | " + config.platform;

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

                    var url = '/dashboard.html';
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
        this.seo.title = "Forgot Password | " + config.platform;
        this.view.message = '';
        if (req.method === 'POST') {
            User.findOne({ email: req.body.email }, function (err, u) {
                if (err || !u) {
                    return cb({message: 'Check your email for further instructions'});
                }
                var meta = new Meta({
                    prop: 'user',
                    pid: u._id,
                    val: 'forgotPass'
                });
                AuthService.forgotPass(u, meta, cb);
            });
        } else {
            cb(null);
        }
    };

    a.resetPassword = function (req, res, cb) {
        this.view.message = null; this.view.errors = {};
        var id = req.params.id, self = this;

        Meta.findOne({ _id: Utils.parseParam(id), val: 'forgotPass' }, function (err, meta) {
            if (err || !meta) {
                return cb(Utils.commonMsg(400));
            }

            if (req.method === 'GET') {
                return cb();
            }

            var pass = req.body.password,
                repeatPass = req.body.repeatPass;

            if (pass !== repeatPass) {
                return cb({ message: "Password's don't match" });
            }

            User.findOne({ _id: meta.pid }, function (err, u) {
                if (err || !u) return cb(Utils.commonMsg(500));

                u.salt = null;  // to hash password on saving
                u.password = pass;
                u.save(function (err) {
                    if (err) {
                        if (err.errors) {
                            self.view.errors = err.errors;
                        }
                        return cb({ message: err.message });
                    }
                    meta.remove();  // remove resetpass request after process is complete
                    cb(Utils.commonMsg(200, 'Password updated'));
                });
            });
        });
    };

    a.verify = function (req, res, cb) {
        this.seo.title = "Verify your Account | " + config.platform;
        Meta.findOne({ prop: 'user', val: Utils.parseParam(req.params.id) }, function (err, meta) {
            if (err || !meta) {
                var err = new Error((Utils.commonMsg(400)).message);
                err.status = 400;
                return cb(err);
            }

            User.update({ _id: meta.pid }, {$set: {live: true}} , function (err) {
                if (err) return false;
                meta.remove();
                return cb(Utils.commonMsg(200, "Account verified"));
            });
        });
    };
    
    a.logout = function (req, res, cb) {
        var admin = req.session.adminUID;
        req.logout();

        if (!admin) return res.redirect('/');
        
        User.findOne({ _id: admin}, function (err, u) {
            if (err || !u) {
                delete req.session.adminUID;
                return;
            }

            req.login(u, function (err) {
                if (err) {
                    return res.redirect('/');
                }
                res.redirect('/admin');
            });
        });
    };

    return a;
}());

module.exports = Auth;
