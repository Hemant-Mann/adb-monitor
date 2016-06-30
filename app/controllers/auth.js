var Shared = require('./controller');
var User = require('../models/user');

/**
 * Auth Controller
 */
var Auth = (function () {
    'use strict';

    var controller = function Auth() {}

    // inherit Methods|Properties
    controller.prototype = new Shared;
    
    var a = new controller();
    a.register = function (req, res, next) {
        
        if (req.method === 'POST') {
            var user = new User(req.body);
            user.save(function (err, user) {
                if (err) {
                    console.log(err);
                    return false;
                }
            });
        }
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