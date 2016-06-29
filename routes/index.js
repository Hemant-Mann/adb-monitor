var express = require('express');
var router = express.Router();

var utils = require('../scripts/util');
var track = require('../controllers/tracking');

/**
 * Home Controller
 */
var Home = (function () {
    'use strict';

    function Home() {

    }

    Home.prototype = {
        index: function (req, res, next) {
            res.send('Index function');
        },
        support: function (req, res, next) {
            res.send('support function');
        },
        contact: function (req, res, next) {
            res.send('contact function');
        },
        privacy: function (req, res, next) {
            res.send('privacy function');
        }
    };

    return new Home();
}());

// Capture  request
var regex = utils.urlRegex(Home);
router.get('/', Home.index);

router.get(regex, function (req, res, next) {

    var method = req.url.match(regex)[1];
    Home[method](req, res, next);
});

router.get('/img/_adm.gif', track);

module.exports = router;
