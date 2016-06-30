/**
 * Home Controller
 */
var Home = (function () {
    'use strict';

    function Home() {

    }

    Home.prototype = {
        index: function (req, res, next) {
            res.send('Index function');
        },
        support: function (req, res, next) {
            res.send('support function');
        },
        contact: function (req, res, next) {
            res.send('contact function');
        },
        privacy: function (req, res, next) {
            res.send('privacy function');
        }
    };

    return new Home();
}());

module.exports = Home;