var Shared = require('./controller');
var User = require('../models/user');
var Utils = require('../scripts/util');
var passport = require('passport');

/**
 * Auth Controller
 */
var Auth = (function () {
    'use strict';

    var controller = function Auth() {}

    // inherit Methods|Properties
    controller.prototype = new Shared;
    
    var a = new controller();
    a.register = function (req, res, cb) {
        this.view.message = null;
        if (req.method === 'POST') {
            if (req.body.password !== req.body.repeatPass) {
                return cb(new Error("Password's Don't Match"));
            }
            var user = new User(req.body);
            user.live = true;

            user.save(function (err, user) {
                if (err) {
                    return cb(err, user);
                }

                if (user) {
                    return cb({message: 'User registered successfully!'}, user);
                }
            });
            return;
        } else {
            cb();
        }
    };
    
    a.login = function (req, res, cb) {
        this.view.message = null;
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

                req.login(user, function(err) {
                    if (err) return cb(err);

                    var url = '/platforms';
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
    
    a.logout = function (req, res, cb) {
        req.logout();
        res.redirect('/');
    };

    a.__class = controller.name.toLowerCase();
    return a;
}());

module.exports = Auth;
