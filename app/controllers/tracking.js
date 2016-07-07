// models
var folder = '../models/';
var Stat = require(folder + 'stat');
    Platform = require(folder + 'platform'),
    Visitor = require(folder + 'visitor'),
    User = require(folder + 'user');

var UAParser = require('ua-parser-js');
var Utils = require('../scripts/util');

var Tracking = {
    validate: function (opts, req, cb) {
        var host, ua, referer, hostRegex;
        opts.ti = Number(opts.ti); // time
        opts.b = Number(opts.b); // blocked: '0' || '1'

        // basic query params type check
        if (isNaN(opts.b) || isNaN(opts.ti) || opts.ckid.length < 19) return cb(false);

        host = String((new Buffer(opts.host, 'base64')).toString('ascii'));
        ua = String((new Buffer(opts.ua, 'base64')).toString('ascii'));
        referer = req.get('Referrer');
        hostRegex = new RegExp(host);

        // Check if params sent by script match with those requesting the resource
        if (ua !== req.headers['user-agent']) return cb(false);
        
        // If No referer then return Or Referer doesn't contain the host
        if (!referer || !referer.match(hostRegex)) return cb(false);

        // find the platform for the ID sent to the server
        Platform.findOne({ _id: opts.pid, live: true }, function (err, platform) {
            if (err || !platform) return cb(false);

            // Check if the platform is executing on the provided domain
            if (platform.domain !== host) return cb(false);

            // Now check device
            User.findOne({ _id: platform.uid, live: true }, function (err, user) {
                if (!user) return cb(false);

                cb(true, { pid: platform._id });
            });
        });
    },
    _isMobile: function (ua) {
        var isMobile = false;
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) isMobile = true;

            return isMobile;
    },
    _isTablet: function (ua) {
        return Boolean(ua.match(/(iPad|SCH-I800|xoom|kindle)/i));
    },
    process: function (req, opts) {
    	var params = req.query,
            parser = new UAParser(),
            ua = req.headers['user-agent'],
            uaResult = parser.setUA(ua).getResult(),
            browser = uaResult.browser.name,
            device = 'desktop';

        if (this._isTablet(ua)) {
            device = 'tablet';
        } else if (this._isMobile(ua)) {
            device = 'mobile';
        }
        // Check Visitor
        Visitor.process({ cookie: params.ckid, pid: opts.pid }, function (err) {
            if (err) return false;

            var query = { pid: opts.pid, browser: browser, device: device };
            var options = Utils.copyObj(query);

            options.block = Number(params.b);
            Stat.process(query, options);   // Process that stats
        });
    },
    display: function (pid, created, cb) {
        var s = {}, total = { allowing: 0, blocking: 0, visitors: 0, pageviews: 0 };
        Stat.find({
            pid: pid,
            created: created
        }, function (err, stats) {
            if (err) return cb(500);
            
            if (!stats || stats.length === 0) {
                return cb(true, {
                    stats: {},
                    total: total
                });
            }

            stats.forEach(function (record) {
                var key = Utils.today(record.created);
                if (typeof s[key] !== "undefined") {
                    s[key].blocking += record.block;
                    s[key].allowing += record.allow;
                } else {
                    s[key] = {
                        blocking: record.block,
                        allowing: record.allow,
                    };
                }

                total.allowing += record.allow;
                total.blocking += record.block;

                total.pageviews += record.allow + record.block;
            });
            Visitor.find({ pid: pid, created: created }, function (err, v) {
                if (err) return cb(Utils.commonMsg(500));
                var unique = {}, prop;

                v.forEach(function (record) {
                    unique[record.cookie] = record;
                });
                for (prop in unique) total.visitors++;

                return cb(false, {
                    stats: s,
                    total: total
                });
            });
        });
    }
};

var execute = function (req, res, next) {
    var params = req.query;

    Tracking.validate(params, req, function (success, opts) {
        if (!success) return false;

        Tracking.process(req, opts)
    });
    res.redirect('/img/_blue.gif');
};

exports.execute = execute;

exports.display = Tracking.display;
