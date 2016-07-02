var urlParser = require('url');

/**
 * Contains Utility functions
 */
var utils = {
    /**
     * Create a regular expression for matching URL
     * for following MVC pattern
     * Eg: if url = "/users/login" i.e "/{controller}/{method}" where method will be
     * a function of the controller
     * Given a controller it will match the method from the URL
     */
    urlRegex: function (controller) {
        var properties = [],
            prop,
            regexString = "";

        for (prop in controller) {
            if (prop.match(/^_.*/i) || typeof controller[prop] !== "function") continue;
            properties.push(prop);
        }

        regexString += '^/(';
        regexString += properties.join('|');
        regexString += ')\.?(html|json)?$';

        return new RegExp(regexString);
    },
    /**
     * Given an array of strings it will form a regular expression
     * It will match "/login" || "/register"
     * @param  {Array} urls       Array of strings (containing URL matches) ["login", "register"]
     * @param  {Array} extensions Array of extensions ["html", "json"]
     * @return {RegExp}            returns a new Regular Expression
     */
    makeRegex: function (urls, extensions) {
        var regexString = '^/(';
        regexString += urls.join('|');
        regexString += ')';

        if (extensions && extensions.length > 0) {
            regexString += '\.?(' + extensions.join('|') + ')?';
        }
        regexString += '$';

        return new RegExp(regexString);
    },
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
            o[prop] = obj[prop];
        }
        return o;
    },
    dateQuery: function (obj) {
        var start, end, tmp;

        start = new Date();
        start.setHours(0, 0, 0, 0);

        end = new Date();
        end.setHours(23, 59, 59, 999);

        if (obj.start) {
            tmp = new Date(obj.start);

            if (tmp !== "Invalid Date") {
                start = tmp;
            }
        }

        if (obj.end) {
            tmp = new Date(obj.end);

            if (tmp !== "Invalid Date") {
                end = tmp;
            }
        }

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
    }
};

module.exports = utils;