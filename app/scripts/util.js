var urlParser = require('url');
var fs = require('fs');
var path = require('path');

/**
 * Contains Utility functions
 */
var utils = {
    validationMsg: function (field, type, opts) {
        var msg = "";
        switch (type) {
            case 'required':
                msg += field + ' is required';
                break;

            case 'min':
                msg += field + ' should be greater than ' + opts.len + ' characters';
                break;

            case 'max':
                msg += field + ' must be less than ' + opts.len + ' characters';
                break;

            case 'regex':
                msg += 'Please fill a valid ' + field;
                break;
        }

        return msg;
    },
    commonMsg: function (code, prefix) {
        var obj = {};
        switch (code) {
            case 500:
                obj.message = "Internal Server Error!";
                break;

            case 400:
                obj.message = "Invalid Request";
                break;

            case 200:
                obj.message = prefix + ' successfully!!';
                break;
        }

        return obj;
    },
    /**
     * GetExtension from the current URL
     * @param  {String} url Path URL eg: '/auth/login'
     * @param  {String} def Default extension eg: "html"
     * @return {String}     Returns the extension of the page
     */
    getExtension: function (url, def) {
        if (!url) return def || "html";

        var path = urlParser.parse(url).pathname
        var parts = path.split(".");

        if (parts.length == 1) {
            return def || "html";
        }
        return parts.pop();
    },
    parseParam: function (param) {
        if (!param) return "";
        var parts = param.split(".");
        return parts[0];
    },
    copyObj: function (obj) {
        var o = {}, prop;

        for (prop in obj) {
            // if (obj.hasOwnProperty(prop)) {
            //     o[prop] = obj[prop];
            // }
            o[prop] = obj[prop];
        }
        return o;
    },
    dateQuery: function (obj) {
        if (!obj) obj = {};
        var start, end, tmp;

        start = new Date(); end = new Date();

        if (obj.start) {
            tmp = new Date(obj.start);

            if (tmp !== "Invalid Date") {
                start = tmp;
            }
        }
        start.setHours(0, 0, 0, 0);

        if (obj.end) {
            tmp = new Date(obj.end);

            if (tmp !== "Invalid Date") {
                end = tmp;
            }
        }
        end.setHours(23, 59, 59, 999);

        return {
            start: start,
            end: end
        };
    },
    today: function (d) {
        if (d) {
            var today = d;
        } else {
            var today = new Date();
        }
        var dd = today.getDate(),
            mm = today.getMonth() + 1, //January is 0!
            yyyy = today.getFullYear();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        today = yyyy + '-' + mm + '-' + dd;
        return today;
    },
    findCountry: function (req) {
        var country = "IN";

        return req.headers['cf-ipcountry'] || country;
    },
    setObj: function (obj, properties) {
        for (var prop in properties) {
            obj[prop] = properties[prop];
        }
        return obj;
    },
    inherit: function (parent, child) {
        var func = new Function('return function ' + child + ' () {}');
        var c = func();
        c.prototype = new parent;
        c.prototype.parent = parent.prototype;

        var obj = new c;
        obj.__class = c.name.toLowerCase();
        return obj;
    },
    ucfirst: function (s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    },
    models: function (cb) {
        var modelPath = path.join(__dirname, '../models/'),
            models = [],
            self = this;

        if (typeof cb === "function") {
            fs.readdir(modelPath, function (err, models) {
                if (err) return cb([]);

                models = models.map(function (val) {
                    var name = val.split(".")[0];
                    name = self.ucfirst(name);
                    return name;
                });

                models.sort();
                return cb(models);
            });
        } else {
            models = fs.readdirSync(modelPath);

            models = models.map(function (val) {
                var name = val.split(".")[0];
                name = self.ucfirst(name);
                return name;
            });

            models.sort();
            return models;
        }
    }
};

module.exports = utils;