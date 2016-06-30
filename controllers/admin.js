/**
 * Admin Controller
 */
var Admin = (function () {
    'use strict';

    function Admin() {

    }

    Admin.prototype = {
        index: function (req, res, next) {
            res.send('Index function');
        }
    };

    return new Admin();
}());

module.exports = Admin;