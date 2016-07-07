var Shared = require('./controller');
var mail = require('../config/mail');
var paypal = require('paypal-rest-sdk');
var paymentConfig = require('../config/payment');
var Utils = require('../scripts/util');

/**
 * Payment Controller
 */
var Payment = (function () {
    'use strict';

    var controller = function Payment() {}
    controller.prototype = new Shared;

    var p = new controller();
    /**
     * Override parent method, set variables which are common
     * to all the views
     */
    p._initView = function () {
    };
    
    p.create = function (req, res, cb) {
        this._noview();
        paypal.configure(paymentConfig);
        var payment = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal"
          },
          "redirect_urls": {
            "return_url": "http://"+ mail.domain + "/payment/success",
            "cancel_url": "http://"+ mail.domain + "/payment/cancel"
          },
          "transactions": [{
            "amount": {
              "total": "1.00",
              "currency": "USD"
            },
            "description": "My awesome payment for adbmonitor"
          }]
        };

        paypal.payment.create(payment, function (err, pay) {
            if (err) {
                return cb(err);
            }

            if (pay.payer.payment_method === 'paypal') {
                req.session.paymentId = pay.id;

                var redirectUrl;

                for(var i=0; i < pay.links.length; i++) {
                    var link = pay.links[i];
                    if (link.method === 'REDIRECT') {
                        redirectUrl = link.href;
                    }
                }
                return res.redirect(redirectUrl);
            }
        });
    };
    
    p.success = function (req, res, cb) {
        this._jsonView();
        cb(null);

        var paymentId = req.session.paymentId;
        var payerId = req.param('PayerID');

        var details = { "payer_id": payerId };
        paypal.payment.execute(paymentId, details, function (err, payment) {
            if (err) {
                return cb(Utils.commonMsg(500));
            }

            return res.send('Payment is complete');
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
