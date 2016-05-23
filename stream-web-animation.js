// Run this from the commandline:
// phantomjs stream-web-animation.js http://somewhere.com | ffmpeg -y -c:v png -f image2pipe -r 24 -t 10  -i - -c:v libx264 -pix_fmt yuv420p -movflags +faststart output.mp4

var width = 1024;
var height = 960;
var system = require('system');

if (system.args.length < 2) {
    console.log('Usage: phantomjs stream-web-animation.js <url>');
    phantom.exit(1);
}

var url = system.args[1];

var page = require('webpage').create(),
    address = url,
    duration = 5, // duration of the video, in seconds
    framerate = 24, // number of frames per second. 24 is a good value.
    counter = 0;

page.viewportSize = { width: width, height: height };

page.open(address, function(status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit(1);
    } else {
        window.setTimeout(function () {
            page.clipRect = { top: 0, left: 0, width: width, height: height };

            window.setInterval(function () {
                counter++;
                page.render('/dev/stdout', { format: 'png' });
                if (counter > duration * framerate) {
                    phantom.exit();
                }
            }, 1/framerate);
        }, 10000);
    }
});
