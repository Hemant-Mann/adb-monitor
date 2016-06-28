var express = require('express');
var router = express.Router();

var utils = require('../scripts/util');

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

// Capture  request
var regex = utils.urlRegex(Auth);

router.get(regex, function (req, res, next) {

    var method = req.url.match(regex)[1];
    Auth[method](req, res, next);
});

module.exports = router;
