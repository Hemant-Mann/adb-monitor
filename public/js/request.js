(function (window, $) {
    var Request = (function () {
        var api = window.location.origin + '/';
        var ext = '.json';
        
        function Request() {
            $.ajaxSetup({
                headers: {'X-JSON-Api': 'SwiftMVC'}
            });   
        }

        Request.prototype = {
            post: function (opts, callback) {
                var self = this,
                    link = api + this._clean(opts.action) + ext;
                $.ajax({
                    url: link,
                    type: 'POST',
                    data: opts.data,
                }).done(function (data) {
                    callback.call(self, data, null);
                }).fail(function () {
                    callback.call(self, null, "error");
                });
            },
            get: function (opts, callback) {
                var self = this,
                    link = api + this._clean(opts.action) + ext;
                $.ajax({
                    url: link,
                    type: 'GET',
                    data: opts.data || "",
                }).done(function (data) {
                    callback.call(self, data, null);
                }).fail(function () {
                    callback.call(self, null, "error");
                });
            },
            _clean: function (entity) {
                if (!entity || entity.length === 0) {
                    return "";
                }
                return entity.replace(/\./g, '');
            },
            delete: function (opts, callback) {
                var self = this,
                    link = api + this._clean(opts.action) + ext;

                $.ajax({
                   url: link,
                   type: 'DELETE',
                   data: opts.data || {}
               })
               .done(function (data) {
                   callback.call(self, data, null);
               }).fail(function () {
                   callback.call(self, null, "error");
               });
            }
        };
        return Request;
    }());
    window.Request = new Request();
}(window, jQuery));
