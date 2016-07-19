var Shared = require('./controller');
var User = require('../models/user');
var Invoice = require('../models/invoice');
var Platform = require('../models/platform');

var Utils = require('../scripts/util');
var mail = require('../config/mail');
var AccService = require('../services/account');
var pService = require('../services/platform');
var config = require('../config/mail');
var async = require('async');

/**
 * Account Controller
 */
var Account = (function () {
    'use strict';

    var a = Utils.inherit(Shared, 'Account');

    a.secure = ['settings', 'billing', 'dashboard', 'quickStats', 'invoice', 'list', 'invoices']; // Add Pages|Methods to this array which needs authentication

    a._secure = function (req, res) {
        var basic = this.parent._secure.call(this, req, res);
        if (!basic) res.redirect('/auth/login.html');
    };
    
    a._initView = function () {
        this.parent._initView.call(this);
        this.defaultLayout = "layouts/client";
    };

    a.settings = function (req, res, cb) {
        var self = this;
        this.seo.title = "Account Settings | " + config.platform;
        self.view.message = null;
        self.view.errors = {};
        if (req.method !== 'POST') {
            return cb();
        }

        var action = req.body.action,
            user = req.user;

        if (action == "saveUser") {
            User.update({ _id: user._id }, { $set: { name: user.name } }, function (err, u) {
                if (err) return cb(Utils.commonMsg(500));
                req.user = user;
                cb(Utils.commonMsg(200, "Account Info updated"));
            });
        } else if (action === "changePass") {
            User.updatePassword(user._id, req.body.password, req.body.npassword, function (err) {
                if (err.errors) {
                    self.view.errors = err.errors;
                }
                return cb({ message: err.message });
            });
        } else {
            cb(); // fallback situation in case of invalid request
        }
    };

    a.billing = function (req, res, next) {
        var self = this;
        this.seo.title = "Account Billing | " + config.platform;
        self.view.message = req.session.message || null;
        delete req.session.message;

        if (req.method == 'POST') { // user wants to buy more credits
            // we will create a new invoice for him and send him for payment
            var data = Invoice.calculate(req.body.visitors);
            Invoice.findOne({ uid: req.user._id, live: false }, function (err, inv) {
                if (inv) {
                    req.session.message = "Please first clear the unpaid invoices!!";
                    return res.redirect('/account/billing.html');
                }

                var inv = new Invoice({
                    uid: req.user._id,
                    visitors: data.visitors,
                    amount: data.price,
                    currency: 'USD',
                    payid: 'PAYPAL_ID'
                });
                inv.save(function (err) {
                    if (err) return next(Utils.commonMsg(500));

                    return res.redirect('/payment/create/' + inv._id);
                });
            });
        } else {
            Invoice.find({ uid: req.user._id }).select('_id visitors amount payid live created currency').sort({ created: -1 }).exec(function (err, invoices) {
                if (err || invoices.length == 0) {
                    self.view.invoices = [];
                } else {
                    self.view.invoices = invoices;
                }

                // AccService.billing(req.user, function (err, used) {
                //     if (err) {
                //         return next(new Error("Internal Server Error"));
                //     }

                //     self.view.used = used;
                //     next(null);
                // });
                self.view.used = req.user.used;
                next();
            });
        }
    };

    a.dashboard = function (req, res, next) {
        var self = this, expired = false;
        this.seo.title = "Account Dashboard | " + config.platform;
        Utils.setObj(self.view, {
            platforms: [],
            quickStats: {},
            message: ''
        });
        if (req.user.used >= req.user.credits) {
            self.view.message = "Your credits have been expired!! Please visit <a href='/account/billing.html'>Billing</a> Page";
            expired = true;
        }
        Platform.find({ uid: req.user._id }, function (err, p) {
            if (err) return next(err);

            if (p.length === 0) {
                return res.redirect('/website/add.html');
            }

            if (expired) {
                p.forEach(function (el) {
                    if (el.live === false) return;
                    el.live = false;
                    el.save();
                });
            }

            self.view.platforms = p;
            next();
        });
    };

    a.quickStats = function (req, res, next) {
        this._jsonView(); var self = this;

        pService.quickStats(req.user, function (err, data) {
            self.view.quickStats = data;

            return next(null);
        });
    };

    a.invoice = function (req, res, next) {
        var id = req.params.invid;

        Invoice.remove({ _id: Utils.parseParam(id), uid: req.user._id, live: false}, function (err) {
            if (err) return next({ message: 'Failed to delete the invoice!!' });

            next(Utils.commonMsg(200, 'Invoice deleted'));
        });
    };

    a._admin = function (req, res, next) {
        if (!req.user.admin) {
            var err = new Error("Not found");
            err.status = 404;
            return next(err);
        }
        this.defaultLayout = "layouts/admin";
    };

    a.list = function (req, res, next) {
        this._admin(req, res, next);
        var self = this,
            limit = req.query.limit || 10,
            page = req.query.page || 1,
            query = {},
            property = req.query.property || "",
            value = req.query.value;

        Utils.setObj(self.view, {
            users: [], page: page, count: 0,
            limit: limit, property: "", value: ""
        });

        if (property) query[property] = value;

        async.waterfall([
            function (callback) {
                User.find(query).limit(limit).skip(limit * (page - 1)).exec(callback);
            },
            function (users, callback) {
                self.view.users = users;

                User.count(query, callback);
            }
        ], function (err, count) {
            self.view.count = count;
            next();
        });
    };

    a.invoices = function (req, res, next) {
        this._admin(req, res, next);
        var self = this,
            limit = req.query.limit || 10,
            page = req.query.page || 1,
            query = {},
            property = req.query.property || "",
            value = req.query.value;

        Utils.setObj(self.view, {
            invoices: [], page: page, count: 0,
            limit: limit, property: "", value: ""
        });
        if (property) query[property] = value;

        async.waterfall([
            function (callback) {
                Invoice.find(query).limit(limit).skip(limit * (page - 1)).exec(callback);
            },
            function (invoices, callback) {
                self.view.invoices = invoices;

                Invoice.count(query, callback);
            }
        ], function (err, count) {
            self.view.count = count;
            next();
        });
    };

    return a;
}());

module.exports = Account;
