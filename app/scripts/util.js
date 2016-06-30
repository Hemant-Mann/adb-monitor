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
    getErrorMessage: function (err) {
        var message = '',
            errName;

        if (err.code) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Username already exists';
                    break;

                default:
                    message = 'Something went wrong';
            }
        } else {
            for (errName in err.errors) {
                if (err.errors[errName].message) {
                    message = err.errors[errName].message;
                }
            }
        }
        return message;
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
                obj.message = "Error Processing request";
                break;

            case 200:
                obj.message = prefix + ' successfully!!';
                break;
        }

        return obj;
    },
    getExtension: function (url) {
        var parts = url.split(".");
        return parts.pop();
    },
    parseParam: function (param) {
        var parts = param.split(".");
        return parts[0];
    }
};

module.exports = utils;