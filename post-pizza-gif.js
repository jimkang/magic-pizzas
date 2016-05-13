var probable = require('probable');
var postImage = require('./post-image');

function postPizzaGif(opts, done) {
  var caption = opts.concept + ' pizza';
  var bangs = probable.roll(10);
  var icons = probable.roll(10);
  for (var i = 0; i < bangs; ++i) {
    caption += '!';
  }
  for (var j = 0; j < icons; ++j) {
    caption = '🍕' + caption + '🍕';
  }

  if (opts.toScreenName) {
    caption += '@' + opts.toScreenName + ' ' + caption;
  }
  
  var postImageOpts = {
    twit: opts.twit,
    dryRun: opts.dryRun,
    filename: opts.filename,
    altText: caption,
    caption: caption
  };

  if (opts.in_reply_to_status_id) {
    postImageOpts.in_reply_to_status_id = opts.in_reply_to_status_id;
  }

  postImage(postImageOpts, done);
}

module.exports = postPizzaGif;
