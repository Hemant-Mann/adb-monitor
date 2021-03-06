$(function () {
    $('#side-menu').metisMenu();
});

$(function () {
    $('select[value]').each(function () {
        $(this).val(this.getAttribute("value"));
    });
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function () {
    $(window).bind("load resize", function () {
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
        if (height < 1)
            height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    var element = $('ul.nav a').filter(function () {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }

    $(".searchModel").change(function() {
        var self = $(this);
        $('.searchField').html('');
        request.get({
            url: "admin/fields",
            data: { model: self.val() }
        }, function(err, data) {
            if (err) return;
            var fields = data.fields;

            fields.forEach(function (f) {
                $('.searchField').append('<option value="'+ f +'">'+ f +'</option>');
            });
        });
    });

    $('.update').on('click', function (e) {
        e.preventDefault();

        var self = $(this),
            type = self.data('request') || 'POST',
            href = self.attr('href') || self.data('href'),
            data = self.data('send');

        request._request({ url: href, data: data }, type, function (err, d) {
            if (err) {
                return bootbox.alert(d);
            }

            bootbox.alert(d.message, function () {
                window.location.href = window.location.href;
            });
        });
    });
});