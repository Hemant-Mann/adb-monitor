var Shared = require('./controller');
var config = require('../config/mail');
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
        this.parent._initView.call(this);
        this.view.email = config.fromEmail;
        this.view.domain = config.domain;
    };
    
    h.index = function (req, res, cb) {
        cb(null);   // pass control to the calling function
    };
    
    h.support = function (req, res, cb) {
        this.seo.title = "Support | " + config.platform;
        cb(null);
    };

    h.pricing = function (req, res, cb) {
        this.seo.title = "Pricing | " + config.platform;
        cb(null);
    };
    
    h.contact = function (req, res, cb) {
        this.seo.title = "Contact US | " + config.platform;
        cb(null);
    };
    
    h.privacy = function (req, res, cb) {
        this.seo.title = "Privacy | " + config.platform;
        cb(null);
    };

    h.terms = function (req, res, cb) {
        this.seo.title = "Terms And Conditions | " + config.platform;
        cb(null);
    };

    return h;
}());

module.exports = Home;
