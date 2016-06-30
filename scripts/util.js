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
    }
};

module.exports = utils;