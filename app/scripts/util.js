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
    }
};

module.exports = utils;