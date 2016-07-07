var Shared = require('./controller');

/**
 * Admin Controller
 */
var Admin = (function () {
    'use strict';

    var controller = function Admin() {}
    controller.prototype = new Shared;
    controller.prototype.parent = Shared.prototype;

    var a = new controller;
	a.index = function (req, res, next) {
		this._noview();
        res.send('Index function');
    };

    a.__class = controller.name.toLowerCase();
    return a;
}());

module.exports = Admin;
