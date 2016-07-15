var Utils = require('../scripts/util');
var urlParser = require('url');
var seo = require('../config/seo');

var getSeo = function () {
    var obj = Utils.copyObj(seo);
    return obj;
};

/**
 * Shared Controller
 */
var Controller = (function () {
    'use strict';

    function Controller() {
        this.seo = getSeo();
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

            self._initView();

            if (!method) {
                var err = new Error("Invalid URL"); err.status = 400;
                return next(err);
            }
            self.method = method;
            self.defaultExtension = Utils.getExtension(req.url);

            self._secure(req, res, next);
            
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
        _secure: function (req, res, next) {
            var self = this;
            self.view.user = null;

            if (self.secure.length < 0 || self.secure.indexOf(self.method) === -1) {
                return true;
            }
            
            if (!req.user) {
                req.session.previousPath = req.originalUrl;
                return false;
            }

            self.view.user = req.user;
            return true;
        },
        _initView: function () {
            this.view = {};
            this.willRenderLayoutView = true;
            this.willRenderActionView = true;
            this.defaultLayout= 'layouts/standard';
            this.seo = getSeo();
        },
        /**
         * Create a regular expression for matching URL for following MVC pattern
         * Eg: if url = "/users/login" i.e "/{controller}/{method}" where method 
         * will be a function of the controller
         */
        _public: function () {
            var properties = [],
                prop,
                regexString = "",
                self = this;

            for (prop in self) {
                if (prop.match(/^_.*/i) || typeof self[prop] !== "function") continue;
                properties.push(prop);
            }

            regexString += '^/(';
            regexString += properties.join('|');
            regexString += ')\.?(html|json)?$';

            return new RegExp(regexString);
        },
        _noview: function () {
            this.willRenderActionView = false;
            this.willRenderLayoutView = false;
        },
        /**
         * Given an array of strings it will form a regular expression
         * It will match "/login" || "/register"
         * @param  {Array} urls       Array of strings (containing URL matches) ["login", "register"]
         * @param  {Array} extensions Array of extensions ["html", "json"]
         * @return {RegExp}            returns a new Regular Expression
         */
        _makeRegex: function (urls, extensions) {
            var regexString = '^/(';
            regexString += urls.join('|');
            regexString += ')';

            if (extensions && extensions.length > 0) {
                regexString += '\.?(' + extensions.join('|') + ')?';
            }
            regexString += '$';

            return new RegExp(regexString);
        }
    };

    return Controller;
}());

module.exports = Controller;
