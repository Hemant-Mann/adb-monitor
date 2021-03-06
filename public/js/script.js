$(document).ready(function() {
    $('.delete').on('click', function (e) {
        e.preventDefault();
        var self = $(this), message = "";
        
        if (!self.attr('href') && !self.data('href')) {
            return false;
        }

        if (self.data('message')) {
            message += self.data('message');
        } else {
            message += 'Are you sure, you want to proceed with the action?!';
        }

        bootbox.confirm(message, function (ans) {
            if (!ans) return;

            var link = self.attr('href') || self.data('href');
            request.delete({url: link}, function (err, data) {
                if (err) {
                    return bootbox.alert(err);
                }

                bootbox.alert(data.message, function () {
                    window.location.href = window.location.href;
                });
            });
        }); 
    });

    $('.getCode').on('click', function (e) {
        e.preventDefault();

        var self = $(this);
        request.get({
            url: self.attr('href'),
            data: {id: self.data('id')}
        }, function (err, data) {
            if (err || data.message) {
                return bootbox.alert(err || data.message);
            }

            var $modal = $('#showCode');
            $('#codeHolder').html(this.escapeHtml(data.code));
            $modal.modal('show');
        });
    });

    $('.update').on('click', function (e) {
        e.preventDefault();

        var self = $(this);

        request.post({ url: self.attr('href'), data: self.data('update') }, function (err, d) {
            if (err) {
                return bootbox.alert(err);
            }

            bootbox.alert(d.message, function() {
                window.location.href = window.location.href;
            });
        });
    });

    /**
     * Refresh the page with the new query data being send by the element
     * but also preserving any query parameters already present on page
     * Element's key=value pair will over ride those present in URL
     */
    $('.refreshPage').on('click', function (e) {
        e.preventDefault();

        var self = $(this);
        var searchQuery = window.location.search;
        var dest = window.location.pathname;
        var send = self.data('send');
        var obj = {};

        if (searchQuery) {
            var sp = searchQuery.split('&') || [];
            sp.forEach(function (el) {
                var pair = el.split('=');
                pair[0] = pair[0].replace(/^\?/, '');

                obj[pair[0]] = pair[1];
            });
        }

        for (var prop in send) {
            obj[prop] = send[prop];
        }

        dest += '?';
        dest += $.param(obj);
        window.location.href = dest;
    });

    var page = window.location.pathname;
    if (page.match(/\/dashboard(\.html)?$/)) {
        request.get({ url: 'account/quickStats' }, function (err, d) {
            if (err) return;

            var selector = $('.quickStats');
            $.each(selector, function (i, el) {
                var $el = $(el);

                var obj = $el.data();
                $el.html(d.quickStats[obj.type] || 0);
            })
        });
    }

    if ($('#morris-area-chart').length > 0) {
        var start = new Date(); start.setMonth(start.getMonth() - 1);
        var end = new Date(); end.setMonth(end.getMonth() + 1);
        var pid, search;

        try {
            pid = window.location.pathname.match(/\/website\/stats\/(\w+)/)[1];
            search = window.location.search;
            search = search.substr(1);
        } catch (e) {
            search = ""; pid = "";
        }

        request.get({
            url: 'website/stats/' + pid,
            data: search
        }, function (err, d) {
            if (err) return false;

            drawGraph(d);
        });
    }

    function today(d) {
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

    function drawGraph(d) {
        var data = [], prop;
        for (prop in d.stats) {
            data.push({
                y: prop,
                a: d.stats[prop].allowing,
                b: d.stats[prop].blocking
            });
        }

        Morris.Area({
            element: 'morris-area-chart',
            data: data,
            xkey: 'y',
            ykeys: ['a', 'b'],
            labels: ['Allowing', 'Blocking'],
            pointSize: 3,
            lineWidth: 1,
            hideHover: 'auto',
            resize: true,
            gridLineColor: '#eef0f2',
            pointFillColors: ['#ffffff'],
            pointStrokeColors: ['#999999'],
            lineColors: ["#00b19d", "#3bafda"]
        });
    }
});

