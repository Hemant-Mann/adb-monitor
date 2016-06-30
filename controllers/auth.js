/**
 * Auth Controller
 */
var Auth = (function () {
    'use strict';

    function Auth() {

    }

    Auth.prototype = {
        login: function (req, res, next) {
            res.send('Login function');
        },
        logout: function (req, res, next) {
            res.send('Logout function');
        }
    };

    return new Auth();
}());

module.exports = Auth;