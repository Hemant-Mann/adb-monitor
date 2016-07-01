(function (window, $) {
    var Request = (function () {
        var api = window.location.origin + '/';
        var ext = '.json';
        
        function Request() {
            $.ajaxSetup({
                
            });
            
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
                    link = api + this._clean(opts.action) + ext;
                $.ajax({
                    url: link,
                    type: 'POST',
                    data: opts.data,
                }).done(function (data) {
                    callback.call(self, null, data);
                }).fail(function () {
                    callback.call(self, "error", {});
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
            delete: function (opts, callback) {
                var self = this,
                    link = api + this._clean(opts.action) + ext;

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
            }
        };
        return Request;
    }());
    window.Request = new Request();
}(window, jQuery));
