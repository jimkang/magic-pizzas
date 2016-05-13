// A whole lot of hacky shelling out goin' on.
var exec = require('child_process').exec;
var baseLinkRenderURL = 'http://jimkang.com/pizza/#/topping/';

function getPizzaGif(imageConceptResult, done) {
  var url = baseLinkRenderURL + encodeURIComponent(imageConceptResult.imgurl);
  url += '/desc/' + imageConceptResult.concept;
  var filename = imageConceptResult.concept + '.gif';

  var cmd = 'phantomjs stream-web-animation.js ' + url + ' | ' +
    'ffmpeg -y -c:v png -f image2pipe -r 20 -t 5  -i - -c:v libx264 -pix_fmt yuv420p -movflags +faststart output.mp4';

  exec(cmd, convertToGif);

  function convertToGif(error) {
    if (error) {
      done(error);
    }
    else {
      var gifCmd = 'ffmpeg -i output.mp4 -r 20 -loop 0 ' + filename;
      exec(gifCmd, passResult);
    }
  }

  function passResult(error) {
    if (error) {
      done(error);
    }
    else {
      var result = {
        filename: filename,
        concept: imageConceptResult.concept
      };
      done(null, result);
    }
  }
}

module.exports = getPizzaGif;
