var Shared = require('./controller');
var User = require('../models/user');
var Invoice = require('../models/invoice');
var Plan = require('../models/plan');

var Utils = require('../scripts/util');
var mail = require('../config/mail');

/**
 * Account Controller
 */
var Account = (function () {
    'use strict';

    var controller = function Account() {}
        // inherit Methods|Properties
    controller.prototype = new Shared;
    controller.prototype.parent = Shared.prototype;

    var a = new controller();

    a.secure = ['settings', 'billing']; // Add Pages|Methods to this array which needs authentication
    a.defaultLayout = "layouts/client"; // change the layout

    a.settings = function (req, res, cb) {
        var self = this;
        self.view.message = null;
        self.view.errors = {};

        if (req.method == 'POST') {
            var action = req.body.action,
                user = req.user;
            user.name = req.body.name;

            if (action == "saveUser") {
                User.update({ _id: user._id }, { $set: { name: user.name } }, function (err, u) {
                    if (err) return cb(Utils.commonMsg(500));
                    req.user = user;
                    cb(Utils.commonMsg(200, "Account Info updated"));
                });
            } else if (action === "changePass") {
                var password = req.body.password;

                User.findOne({ _id: user._id }, function (err, u) {
                    if (err) return cb(Utils.commonMsg(500));

                    if (!u.authenticate(password)) {
                        return cb({ message: "Invalid Password" });
                    }

                    u.password = req.body.npassword;
                    u.save(function (err) {
                        req.user = u;
                        self.view.user = u;

                        if (err && err.errors) {
                            self.view.errors = err.errors;
                            return cb({ message: err.message });
                        }

                        cb(Utils.commonMsg(200, "Password updated"));
                    });
                });
            } else {
                cb(); // fallback situation in case of invalid request
            }
        } else {
            cb();
        }
    };

    a._expired = function (subscription) {
        var today = new Date();

        if (!subscription || subscription.end < today) {
            return true;
        }
        return false;
    };

    a._payment = function (subscription, req, cb) {
        var self = this;
        // if payment already set then don't set it again
        self.view.payment = true;
        if (!subscription || req.session.payment) {
            return cb(null);
        }

        Plan.findOne({ _id: subscription.plan }, function (err, plan) {
            if (err || !plan) return cb(null);

            var payment = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://" + mail.domain + "/payment/success",
                    "cancel_url": "http://" + mail.domain + "/payment/cancel"
                },
                "transactions": [{
                    "amount": {
                        "total": plan.price,
                        "currency": plan.currency
                    },
                    "description": plan.description
                }]
            };

            req.session.payment = payment;
            return cb();
        });
    }

    a.billing = function (req, res, next) {
        var self = this;
        self.view.payment = false;

        Invoice.find({ uid: req.user._id }, function (err, invoices) {
            if (err || invoices.length == 0) {
                self.view.invoices = [];
            } else {
                self.view.invoices = invoices;
            }

            var subscription = req.session.subscription
            if (self._expired(subscription)) { // show payment option only when 
                return self._payment(subscription, req, next);
            }
            return next(null);
        });
    };

    a.__class = controller.name.toLowerCase();
    return a;
}());

module.exports = Account;
