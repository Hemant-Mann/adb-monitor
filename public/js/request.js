/**
 * Request Library a wrapper around jQuery Ajax
 * @param  {Object} window The Global window object
 * @param  {function} $      jQuery function
 * @return {Object}        A new object of the library
 */
(function (window, $) {
    var Request = (function () {
        
        $.ajaxSetup({});

        function Request() {
            this.api = window.location.origin + '/'; // Api EndPoint
            this.extension = '.json';
            
            this.entityMap = {
               "&": "&amp;",
               "<": "&lt;",
               ">": "&gt;",
               '"': '&quot;',
               "'": '&#39;',
               "/": '&#x2F;'
             };

            this.escapeHtml = function escapeHtml(string) {
                var self = this;
                return String(string).replace(/[&<>"'\/]/g, function (s) {
                    return self.entityMap[s];
                });
            };
        }

        Request.prototype = {
            post: function (opts, callback) {
                var self = this,
                    link = this.api + this._clean(opts.url) + this.extension;
                $.ajax({
                    url: link,
                    type: 'POST',
                    data: opts.data || {},
                }).done(function (data) {
                    callback.call(self, null, data);
                }).fail(function () {
                    callback.call(self, "error", {});
                });
            },
            get: function (opts, callback) {
                var self = this,
                    link = this.api + this._clean(opts.url) + this.extension;
                $.ajax({
                    url: link,
                    type: 'GET',
                    data: opts.data || {},
                }).done(function (data) {
                    callback.call(self, null, data);
                }).fail(function () {
                    callback.call(self, "error", {});
                });
            },
            delete: function (opts, callback) {
                var self = this,
                    link = this.api + this._clean(opts.url) + this.extension;

                $.ajax({
                   url: link,
                   type: 'DELETE',
                   data: opts.data || {}
               })
               .done(function (data) {
                   callback.call(self, null, data);
               }).fail(function () {
                   callback.call(self, "error", {});
               });
            },
            _clean: function (entity) {
                if (!entity || entity.length === 0) {
                    return "";
                }
                return entity.replace(/\./g, '');
            },
        };
        return Request;
    }());
    // Because window.Request is already taken
    window.request = new Request();
}(window, jQuery));
