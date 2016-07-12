var Shared = require('./controller');

/**
 * Admin Controller
 */
var Admin = (function () {
    'use strict';

    var a = Utils.inherit(Shared, 'Admin');
	a.index = function (req, res, next) {
		this._noview();
        res.send('Index function');
    };
    
    return a;
}());

module.exports = Admin;
