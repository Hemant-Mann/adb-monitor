var Shared = require('./controller');

/**
 * Home Controller
 */
var Home = (function () {
    'use strict';

    var controller = function Home() {}
    controller.prototype = Shared;

    var h = new controller();
    h.index = function (req, res, next) {
        this.view.data = "This is the data set by controller in view";
    };
    
    h.support = function (req, res, next) {
        this._noview();
        res.send('support function');
    };
    
    h.contact = function (req, res, next) {
        this._noview();
        res.send('contact function');
    };
    
    h.privacy = function (req, res, next) {
        this._noview();
        res.send('privacy function');
    };

    h.__class = controller.name.toLowerCase();
    return h;
}());

module.exports = Home;
