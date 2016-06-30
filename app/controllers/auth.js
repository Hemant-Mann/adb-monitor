var Shared = require('./controller');
var User = require('../models/user');
var Utils = require('../scripts/util');

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

            user.save(function (err, user) {
                if (err) {
                    return cb(err, user);
                }

                if (user) {
                    return cb({message: 'User registered successfully!'}, user);
                }
            });
            return;
        }
        cb(null);
    };
    
    a.login = function (req, res, next) {
        this.view.validations = {
            name: "required",
            email: "greater than 3 chars"
        };
    };
    
    a.logout = function (req, res, next) {
        this.noview();
        res.send('Logout function');
    };

    a.__class = controller.name.toLowerCase();
    return a;
}());

module.exports = Auth;