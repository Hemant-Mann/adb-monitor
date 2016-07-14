var Shared = require('./controller');
var Utils = require('../scripts/util');

/**
 * Admin Controller
 */
var Admin = (function () {
    'use strict';

    var a = Utils.inherit(Shared, 'Admin');
    a.secure = ['index'];

    a._secure = function (req, res) {
    	var basic = this.parent._secure.call(this, req, res);
    	if (!basic) return false;

    	return true;
    };

	a.index = function (req, res, next) {
		this._noview();
        res.send('Index function');
    };
    
    return a;
}());

module.exports = Admin;
