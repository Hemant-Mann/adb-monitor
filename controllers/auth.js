var Shared = require('./controller');

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
        this._jsonView();
        this.view.fields = ["email", "password"];
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