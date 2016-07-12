var Shared = require('./controller');
var email = require('../config/mail').fromEmail;
var Utils = require('../scripts/util');

/**
 * Home Controller
 */
var Home = (function () {
    'use strict';

    var h = Utils.inherit(Shared, 'Home');
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

    h.pricing = function (req, res, cb) {
        cb(null);
    };
    
    h.contact = function (req, res, cb) {
        cb(null);
    };
    
    h.privacy = function (req, res, cb) {
        cb(null);
    };

    h.terms = function (req, res, cb) {
        cb(null);
    };

    return h;
}());

module.exports = Home;
