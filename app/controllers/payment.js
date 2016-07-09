var Shared = require('./controller');
var mail = require('../config/mail');
var paypal = require('paypal-rest-sdk');
var paymentConfig = require('../config/payment');
var Utils = require('../scripts/util');
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

    p._pay = function (invid, cb) {
        Invoice.findOne({ _id: invid, live: false }, function (err, inv) {
            if (err || !inv) return cb(new Error("Invalid Request"));
            
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
                        "total": "1.00",
                        "currency": "USD"
                    },
                    "description": "Buy 10,000 visitors"
                }]
            };

            return cb(false, inv, payment);
        });
    }
    
    p.create = function (req, res, cb) {
        var self = this; this._noview();
        paypal.configure(paymentConfig);

        self._pay(Utils.parseParam(req.params.invid), function (err, invoice, payment) {
            if (err) return cb(err);

            req.session.invoice = invoice;

            paypal.payment.create(payment, function (err, pay) {
                if (err) return cb(err);

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
                } else {
                    return cb(Utils.commonMsg(500));
                }
            });
        });
    };
    
    p.success = function (req, res, cb) {
        this._jsonView(); var self = this;

        var paymentInfo = req.session.paymentInfo || {},
            paymentId = paymentInfo.id,
            payerId = req.param('PayerID'),
            details = { "payer_id": payerId },
            invoice = req.session.invoice;

        paypal.payment.execute(paymentId, details, function (err, payment) {
            if (err) {
                return cb(Utils.commonMsg(500));
            }

            self.view.payment = payment;
            invoice.payid = paymentId;
            invoice.live = true;
            invoice.save();

            delete req.session.invoice;
            delete req.session.paymentInfo;
            return cb();
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
