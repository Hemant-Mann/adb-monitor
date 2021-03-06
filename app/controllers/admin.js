var Shared = require('./controller');
var Utils = require('../scripts/util');
var async = require('async');
var User = require('../models/user');
var Platform = require('../models/platform');
var mongoose = require('mongoose');
var config = require('../config/mail');

/**
 * Admin Controller
 */
var Admin = (function () {
    'use strict';

    var a = Utils.inherit(Shared, 'Admin');
    a.secure = ['index', 'search', 'fields', 'edit', 'info', 'update', 'delete', 'loginas'];

    String.prototype.ucfirst = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    a._initView = function () {
    	this.parent._initView.call(this);
    	this.defaultLayout = "layouts/admin";
    	this.seo.title = "Admin Panel";
    };

    a._secure = function (req, res, next) {
    	var basic = this.parent._secure.call(this, req, res, next);
        if (!basic || !req.user.admin) {
            var err = new Error("Not found");
            err.status = 404;
            return next(err);
        }
    };

	a.index = function (req, res, next) {
		var self = this; this.seo.title = "Admin | " + config.platform;
		self.view.users = {total: 0, admin: 0, blocked: 0};
		self.view.platforms = 0; self.view.invoices = 0;

		async.waterfall([
			function (callback) {
				User.find({}, 'admin live', callback);
			},
			function (users, callback) {
				users.forEach(function (el) {
					if (!el.live) self.view.users.blocked++;
					if (el.admin) self.view.users.admin++;

					self.view.users.total++;
				});
				Platform.count({}, callback);
			},
            function (platforms, callback) {
                self.view.platforms = platforms;
                var Invoice = mongoose.model('Invoice');
                Invoice.count({}, callback);
            }
		], function (err, invoices) {
			if (err) return next();
			self.view.invoices = invoices;
			next();
		});
    };

    a.search = function (req, res, next) {
        this.seo.title = "Admin Search | " + config.platform;
    	var params = req.query,
    		self = this,
    		model = params.model || "",
    		property = params.key || "_id",
    		value = params.value,
    		page = params.page || 1,
    		limit = params.limit || 10,
    		sign = params.sign || "equal",
    		order = params.order || "created",
    		$sort = params['sort'] || "desc";

    	Utils.setObj(self.view, {
    		results: [], fields: [], model: model.ucfirst(),
    		page: page, limit: limit, property: property,
    		val: value, sign: sign, order: order,
    		sort: $sort, count: 0, success: false,
            models: Utils.models()
    	});
    	if (!model || !property) return next();

    	var where = {}, fields, m, sortQ = {};
    	if (sign == "like") {
    		where[property] = new RegExp(value, 'i');
    	} else {
    		where[property] = value;
    	}

        switch ($sort) {
            case 'desc': sortQ[order] = -1; break;
            case 'asc': sortQ[order] = 1; break;
            default: sortQ[order] = 1;
        }

    	try {
    		model = model.ucfirst();
    		m = mongoose.model(model);

    		async.waterfall([
    			function (callback) {
    				m.find(where).sort(sortQ).limit(limit).skip(limit * (page - 1)).exec(callback);
    			},
    			function (objects, callback) {
    				self.view.results = objects;

                    if (objects.length > 0) {
                        self.view.fields = Object.keys(objects[0].schema.paths);
                    }
    				m.count(where, callback);
    			}
    		], function (err, count) {
    			if (err) return next(err);

    			if (count == 0) {
    				self.view.success = "No results found";
    			} else {
    				self.view.success = "Total Results: " + count;
    			}
    			self.view.count = count;
    			next();
    		});
    	} catch (e) {
    		next(e);
    	}
    };

    a.info = function (req, res, next) {
    	var model = req.params.model || "",
            self = this;

        model = model.ucfirst();
        this.seo.title = "Admin Info - " + model + " | " + config.platform;
        self.view.item = {};
        self.view.model = model;
        try {
            var m = mongoose.model(model);

            m.findOne({_id: Utils.parseParam(req.params.id)}, function (err, item) {
                if (err || !item) {
                    return next(new Error("Invalid Request"));
                }

                for (var prop in item.schema.paths) {
                    self.view.item[prop] = item[prop];
                }
                next();
            });
        } catch (e) {
            next(e);
        }
    };

    a.update = function (req, res, next) {
        var model = req.params.model || "",
            self = this;

        model = model.ucfirst();
        this.seo.title = "Admin Update - " + model + " | " + config.platform;
        if (!model) return next(new Error("Invalid Request"));
        Utils.setObj(self.view, {
            item: {}, today: Utils.today,
            model: model, success: false,
            disabled: ["_id", "created", "modified", "password", "salt"]
        });

        try {
            var m = mongoose.model(model);

            m.findOne({_id: Utils.parseParam(req.params.id)}, function (err, item) {
                if (err || !item) {
                    return next(new Error("Invalid Request"));
                }

                for (var prop in item.schema.paths) {
                    self.view.item[prop] = item[prop];
                }
                if (req.session.saved) {
                    self.view.success = true;
                    delete req.session.saved;
                }
                next();
            });
        } catch (e) {
            next(e);
        }
    };

    a._update = function (req, res, next) {
        var model = req.params.model || "",
            self = this,
            fields = req.body;

        model = model.ucfirst();
        if (!model) return next(new Error("Invalid Request"));

        try {
            var m = mongoose.model(model);
            m.findOne({ _id: Utils.parseParam(req.params.id)}, function (err, item) {
                for (var f in fields) {
                    item[f] = fields[f];
                }
                item.save();

                req.session.saved = true;
                res.redirect('/admin/update/' + model + '/' + item._id);
            });
        } catch (e) {
            next(e);
        }
    };

    a.edit = function (req, res, next) {
        var params = req.query,
            model = params.model || "",
            id = params.id,
            property = params.property,
            value = params.value,
            self = this;

        model = model.ucfirst();
        if (!model || !id || !property) return next(new Error("Invalid Request"));
        try {
            var m = mongoose.model(model);
            var set = {}; set[property] = value;
            m.update({ _id: Utils.parseParam(id) }, {$set: set}, function (err) {
                if (err) return next(err);

                if (params.response) {
                    self._jsonView();
                    next({ message: "Updated Succesfully!!" });
                } else {
                    return res.redirect(req.get('Referrer'));
                }
            });
        } catch (e) {
            next(e);
        }
    };

    a.delete = function (req, res, next) {
        var params = req.params || "",
            model = params.model,
            id = params.id;

        model.ucfirst();
        if (!model || !id) return next(new Error("Invalid Request"));
        try {
            var m = mongoose.model(model);
            m.remove({ _id: Utils.parseParam(id) }, function (err) {
                if (err) return next(err);
                return res.redirect(req.get('Referrer'));
            });
        } catch (e) {
            next(e);
        }
    };

    a.fields = function (req, res, next) {
        var model = req.query.model,
            self = this;
        if (!model) return next(new Error("Invalid Request"));

        model = model.ucfirst();
        try {
            var m = mongoose.model(model);
            
            self.view.fields = Object.keys(m.schema.paths);
            next();
        } catch (e) {
            self.view.fields = [];
        }
    };

    a.loginas = function (req, res, next) {
        var uid = req.query.uid;
        if (!uid) return next(new Error('Not found'));

        req.session.adminUID = req.user._id;
        User.findOne({ _id: uid }, function (err, u) {
            if (err || !u) next(new Error('Not found'));

            req.login(u, function (err) {
                if (err) return next(err);

                res.redirect('/dashboard');
            });
        });
    };
    
    return a;
}());

module.exports = Admin;
