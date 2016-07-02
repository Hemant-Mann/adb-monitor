$(function() {
    $('#side-menu').metisMenu();
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    var element = $('ul.nav a').filter(function() {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }
});

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

    if ($('#morris-area-chart').length > 0) {
        var start = new Date(); start.setMonth(start.getMonth() - 1);
        var end = new Date(); end.setMonth(end.getMonth() - 1);

        var pid = window.location.pathname.match(/\/platforms\/(\w+)/)[1];
        request.get({
            url: 'platforms/' + pid + window.location.search,
            start: today(start),
            end: today(end)
        }, function (err, d) {
            if (err) return false;

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
                pointSize: 2,
                hideHover: 'auto',
                resize: true
            });
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
});

