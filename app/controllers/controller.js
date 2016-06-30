/**
 * Shared Controller
 */
var Controller = (function () {
    'use strict';

    var seo = {
        title: 'Express MVC',
        description: 'This is a MVC framework built on top of Express',
        keywords: 'mvc, framework, mvc framework, express, node js framework, node js, javascript',
        photo: null, // path to logo,
        author: 'Hemant Mann'
    };

    function Controller() {
        this.seo = seo;
        this.__class = '';
        this.willRenderLayoutView = true;
        this.willRenderActionView = true;
        this.defaultLayout= 'layouts/standard';
        this.defaultExtension = "html";
        this.method = ''; // will store the method which has been called
        this.view = {}; // Properties set on this object can be accessed in views
    }

    /**
     * Contains methods shared with all children, method name should start with "_"
     * to prevent it from being rendered in the HTML View
     * @type {Object}
     */
    Controller.prototype = {
        _init: function (req, res, next) {
            var self = this,
                method = req.params[0] || null;

            if (!method) {
                if (req.url === '/') {
                    method = 'index';
                } else {
                    return next(new Error("Invalid URL"));
                }
            }
            self.method = method;
            self.defaultExtension = req.params[1] || "html";

            self[method](req, res, next);

            self._render(res, next);
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
                view = self.view;

            view.__action = action;
            if (self.defaultExtension == "html") {
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
            }
        }
    };

    return Controller;
}());

module.exports = Controller;