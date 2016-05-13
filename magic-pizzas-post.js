var config = require('./config');
// var config = require('./test-config');

var Twit = require('twit');
var async = require('async');
var postImage = require('./post-image');
var getRandomPizzaGif = require('./get-random-pizza-gif');
var probable = require('probable');

var dryRun = false;

if (process.argv.length > 2) {
  dryRun = (process.argv.indexOf('--dry') !== -1);
}

var twit = new Twit(config.twitter);

async.waterfall(
  [
    obtainImage,
    postPizzaGif
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

function postPizzaGif(gifResult, done) {
  var caption = gifResult.concept + ' pizza';
  var bangs = probable.roll(10);
  var icons = probable.roll(10);
  for (var i = 0; i < bangs; ++i) {
    caption += '!';
  }
  for (var j = 0; j < icons; ++j) {
    caption = '🍕' + caption + '🍕';
  }
  
  var postImageOpts = {
    twit: twit,
    dryRun: dryRun,
    filename: gifResult.filename,
    altText: caption,
    caption: caption
  };

  postImage(postImageOpts, done);
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
