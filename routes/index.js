var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
var track = require('../controllers/tracking');
var Home = require('../controllers/home');

// Capture  request
var regex = Utils.urlRegex(Home);
router.get('/', Home.index);

router.get(regex, function (req, res, next) {

    var method = req.url.match(regex)[1];
    Home[method](req, res, next);
});

router.get('/img/_adm.gif', track);

module.exports = router;
