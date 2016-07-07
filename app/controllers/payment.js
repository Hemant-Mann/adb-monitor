var Shared = require('./controller');
var mail = require('../config/mail');
var paypal = require('paypal-rest-sdk');
var paymentConfig = require('../config/payment');
var Utils = require('../scripts/util');
var Subscription = require('../models/subscription');
var Plan = require('../models/plan');
var Invoice = require('../models/invoice');

/**
 * Payment Controller
 */
var Payment = (function () {
    'use strict';

    var controller = function Payment() {}
    controller.prototype = new Shared;
    controller.prototype.parent = Shared.prototype;

    var p = new controller();
    p.secure = ['create', 'cancel', 'success'];
    
    p.create = function (req, res, cb) {
        this._noview();
        paypal.configure(paymentConfig);
        var payment = req.session.payment;

        if (!payment) {
            return cb(new Error("Payment Not authorized"));
        }
        delete req.session.payment;

        paypal.payment.create(payment, function (err, pay) {
            if (err) {
                return cb(err);
            }

            if (pay.payer.payment_method === 'paypal') {
                req.session.paymentInfo = {
                    id: pay.id,
                    amount: 50 // here add amount of transaction
                };

                var redirectUrl, link, i;

                for(i = 0; i < pay.links.length; i++) {
                    link = pay.links[i];
                    if (link.method === 'REDIRECT') {
                        redirectUrl = link.href;
                    }
                }
                return res.redirect(redirectUrl);
            }
        });
    };
    
    p.success = function (req, res, cb) {
        this._jsonView(); var self = this;

        var paymentInfo = req.session.paymentInfo || {};
        var paymentId = paymentInfo.id;
        var payerId = req.param('PayerID'),
            subscription = req.session.subscription || {},
            details = { "payer_id": payerId };

        paypal.payment.execute(paymentId, details, function (err, payment) {
            if (err) {
                return cb(Utils.commonMsg(500));
            }

            self.view.payment = payment;
            var invoice = new Invoice({
                uid: req.user._id,
                plan: subscription.plan,
                price: paymentInfo.amount,
                payid: paymentId,
                live: true
            });
            invoice.save();

            Plan.findOne({ _id: subscription.plan }, function (err, plan) {
                if (err || !plan) return cb(Utils.commonMsg(500));

                var start = new Date(); var end = new Date(); end.setHours(0, 0, 0, 0);
                end.setDate(start.getDate() + plan.period);

                Subscription.update({ _id: req.session.subscription._id }, {$set: {
                    start: start,
                    end: end
                }}, function (err) {

                });
                return res.send('Payment is complete');
            });
        });
    };
    
    p.cancel = function (req, res, cb) {
        this._noview();
        res.send('payment cancelled');
    };

    p.__class = controller.name.toLowerCase();
    return p;
}());

module.exports = Payment;
