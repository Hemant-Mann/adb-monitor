var Utils = require('../scripts/util');
var urlParser = require('url');
var seo = require('../config/seo');

/**
 * Shared Controller
 */
var Controller = (function () {
    'use strict';

    function Controller() {
        this.seo = seo;
        this.__class = '';
        this.willRenderLayoutView = true;
        this.willRenderActionView = true;
        this.defaultLayout= 'layouts/standard';
        this.defaultExtension = "html";
        this.method = ''; // will store the method which has been called
        this.view = {}; // Properties set on this object can be accessed in views
        this.secure = [];   // Array to hold which functions needs authorization before executing
    }

    /**
     * Contains methods shared with all children, method name should start with "_"
     * to prevent it from being rendered in the HTML View
     * @type {Object}
     */
    Controller.prototype = {
        _init: function (req, res, next, opts) {
            if (!opts) opts = {};
            var self = this,
                method = opts.method || (req.params[0]);

            self.view = {};

            if (!method) {
                var err = new Error("Invalid URL"); err.status = 400;
                return next(err);
            }
            self.method = method.toLowerCase();
            self.defaultExtension = Utils.getExtension(req.url);

            if (self.secure.length > 0 && self.secure.indexOf(self.method) !== -1) {
                if (!self._secure(req, res)) {
                    return res.redirect('/auth/login');
                }
            }
            
            self[method](req, res, function (err, success) {
                if (err) {
                    self.view.message = err.message;
                } else if (success) {
                    self.view.success = success;   
                }

                if (err && err instanceof Error) {
                    return next(err);
                } else {
                    self._render(res, next);
                }
            });
        },
        _noview: function () {
            this.willRenderLayoutView = false;
            this.willRenderActionView = false;
        },
        _jsonView: function () {
            this.defaultExtension = "json";
        },
        _render: function (res, next) {
            var self = this,
                template = self.defaultLayout,
                action = self.__class +'/' + self.method,
                view = Utils.copyObj(self.view);

            if (self.defaultExtension == "html") {
                view.__action = action;
                view.seo = self.seo;
                
                if (this.willRenderLayoutView) {
                    view.__action = '../' + view.__action;
                    res.render(template, view);
                } else if (this.willRenderActionView) {
                    res.render(action, view);
                } else {
                    return false;
                }
            } else if (self.defaultExtension == "json") {
                if (!self.willRenderActionView || !self.willRenderLayoutView) {
                    return false;
                }
                res.json(self.view);
            } else {
                var err = new Error("Invalid URL");
                err.status = 400;
                next(err);
            }
        },
        /**
         * Basic Implementation for authorization, Can be override to suit particular
         * controller requirements for authorization
         * @param  {Object} req Express Request Object
         * @return {Boolean} False on failure else sets user to views
         */
        _secure: function (req) {
            if (!req.user) {
                req.session.previousPath = req.originalUrl
                return false;
            }

            this.view.user = req.user;
            return true;
        }
    };

    return Controller;
}());

module.exports = Controller;
