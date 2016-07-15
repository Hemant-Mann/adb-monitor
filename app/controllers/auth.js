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
    a.beforeSession = ['login', 'register', 'forgotPassword', 'verify'];

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
        cb(null);
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
        req.logout();
        res.redirect('/');
    };

    return a;
}());

module.exports = Auth;
