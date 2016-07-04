var Shared = require('./controller');
var email = require('../config/mail').fromEmail;

/**
 * Home Controller
 */
var Home = (function () {
    'use strict';

    var controller = function Home() {}
    controller.prototype = new Shared;

    var h = new controller();
    h.index = function (req, res, cb) {
        this.view.email = email;
        cb(null);   // pass control to the calling function
    };
    
    h.support = function (req, res, cb) {
        this._noview();
        res.send('support function');
    };
    
    h.contact = function (req, res, cb) {
        this._noview();
        res.send('contact function');
    };
    
    h.privacy = function (req, res, cb) {
        this._noview();
        res.send('privacy function');
    };

    h.__class = controller.name.toLowerCase();
    return h;
}());

module.exports = Home;
