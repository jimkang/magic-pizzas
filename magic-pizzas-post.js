var config = require('./config');
// var config = require('./test-config');

var Twit = require('twit');
var async = require('async');
var getRandomPizzaGif = require('./get-random-pizza-gif');
var postPizzaGif = require('./post-pizza-gif');

var dryRun = false;

if (process.argv.length > 2) {
  dryRun = (process.argv.indexOf('--dry') !== -1);
}

var twit = new Twit(config.twitter);

async.waterfall(
  [
    obtainImage,
    postImageToTwitter
  ],
  wrapUp
);

function obtainImage(done) {
  var opts = {
    twit: twit,
    config: config
  };
  getRandomPizzaGif(opts, done);
}

function postImageToTwitter(imageResult, done) {
  var opts = {
    twit: twit,
    dryRun: dryRun,
    filename: imageResult.filename,
    concept: imageResult.concept
  };
  postPizzaGif(opts, done);
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
  else {
    // Technically, the user wasn't replied to, but good enough.
    // lastTurnRecord.recordTurn(callOutId, new Date(), reportRecording);
  }
}
