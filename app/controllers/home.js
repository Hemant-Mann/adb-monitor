var Shared = require('./controller');
var email = require('../config/mail').fromEmail;

/**
 * Home Controller
 */
var Home = (function () {
    'use strict';

    var controller = function Home() {}
    controller.prototype = new Shared;
    controller.prototype.parent = Shared.prototype;

    var h = new controller();
    /**
     * Override parent method, set variables which are common
     * to all the views
     */
    h._initView = function () {
        this.view.email = email;
    };
    
    h.index = function (req, res, cb) {
        cb(null);   // pass control to the calling function
    };
    
    h.support = function (req, res, cb) {
        cb(null);
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
