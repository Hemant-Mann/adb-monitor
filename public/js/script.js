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

        var self = $(this);
        if (!self.attr('href') && !self.data('href')) {
            return false;
        }

        var link = self.attr('href') || self.data('href');
        console.log(link);
        Request.delete({action: link}, function (err, data) {
            if (err) {
                console.log(err);
                return alert(self.data('error-msg') || 'Failed to delete');
            }

            window.location.href = window.location.href;
        });
    });

    $('.getCode').on('click', function (e) {
        e.preventDefault();

        var self = $(this);
        Request.get({
            action: self.attr('href'),
            data: {id: self.data('id')}
        }, function (err, data) {
            if (err || data.message) {
                return console.log(err || data.message);
            }

            var $modal = $('#showCode');
            $('#codeHolder').html(this.escapeHtml(data.code));
            $modal.modal('show');
        });
    });
});

