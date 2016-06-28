var express = require('express');
var router = express.Router();

var utils = require('../scripts/util');

/**
 * Admin Controller
 */
var Admin = (function () {
    'use strict';

    function Admin() {

    }

    Admin.prototype = {
        index: function (req, res, next) {
            res.send('Index function');
        }
    };

    return new Admin();
}());

// Capture  request
var regex = utils.urlRegex(Admin);
router.get('/', Admin.index);

router.get(regex, function (req, res, next) {

    var method = req.url.match(regex)[1];
    Admin[method](req, res, next);
});

module.exports = router;
