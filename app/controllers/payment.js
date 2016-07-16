var Shared = require('./controller');
var mail = require('../config/mail');
var paypal = require('paypal-rest-sdk');
var paymentConfig = require('../config/payment');
var Utils = require('../scripts/util');
var Invoice = require('../models/invoice');
var Platform = require('../models/platform');

/**
 * Payment Controller
 */
var Payment = (function () {
    'use strict';

    var p = Utils.inherit(Shared, 'Payment');
    p.secure = ['create', 'cancel', 'success'];

    p._secure = function (req, res) {
        var basic = this.parent._secure.call(this, req, res);
        if (!basic) res.redirect('/auth/login.html');
    };

    p._initView = function () {
        this.parent._initView.call(this);
        this.defaultLayout = "layouts/client";
    };

    p._pay = function (invid, uid, cb) {
        Invoice.findOne({ _id: invid, live: false, uid: uid }, function (err, inv) {
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
                        "total": inv.amount,
                        "currency": inv.currency
                    },
                    "description": "Buy " + inv.visitors +" visitors"
                }]
            };

            return cb(false, inv, payment);
        });
    }
    
    p.create = function (req, res, cb) {
        var self = this; this._noview();
        paypal.configure(paymentConfig);

        self._pay(Utils.parseParam(req.params.invid), req.user._id, function (err, invoice, payment) {
            if (err) return cb(err);

            req.session.invoice = invoice;

            paypal.payment.create(payment, function (err, pay) {
                if (err) return cb(err);

                if (pay.payer.payment_method === 'paypal') {
                    req.session.paymentInfo = {
                        id: pay.id,
                        amount: invoice.amount
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
        var self = this;
        self.seo.title = 'Payment Succesful';

        var paymentInfo = req.session.paymentInfo || {},
            paymentId = paymentInfo.id,
            details = { "payer_id": req.param('PayerID') },
            invoice = req.session.invoice,
            user = req.user;

        paypal.payment.execute(paymentId, details, function (err, payment) {
            if (err) {
                return cb(Utils.commonMsg(500));
            }

            self.view.payment = payment;
            invoice.payid = paymentId;
            invoice.live = true;
            invoice.save();

            if (!user.credits) {
                user.credits = 0;
            }
            user.salt = null;   // to prevent password override
            user.credits += Number(invoice.visitors);
            user.save();

            Platform.update({ uid: user._id }, {$set: {live: true}}, function (err) {
                // do nothing
            });

            delete req.session.invoice;
            delete req.session.paymentInfo;
            return cb({ message: "You have successfully completed the payment" });
        });
    };
    
    p.cancel = function (req, res, cb) {
        this.seo.title = 'Payment Cancelled';
        this.view.message = 'Payment Cancelled';
        delete req.session.invoice;
        delete req.session.paymentInfo;
        cb();
    };

    return p;
}());

module.exports = Payment;
