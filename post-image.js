var request = require('request');
var async = require('async');
var pick = require('lodash.pick');
var callNextTick = require('call-next-tick');

// TODO: This could be in its own package.
function postImage(opts, allDone) {
  var twit;
  var dryRun;
  var filename;
  var altText;
  var caption;
  var in_reply_to_status_id;

  if (opts) {
    twit = opts.twit;
    dryRun = opts.dryRun;
    filename = opts.filename;
    altText = opts.altText;
    caption = opts.caption;
    in_reply_to_status_id = opts.in_reply_to_status_id;
  }

  if (filename.length < 1) {
    callNextTick(
      allDone, new Error('Received bad filename in postImage opts: ' + JSON.stringify(opts))
    );
    return;
  }

  console.log('Posting image for', altText, JSON.stringify(opts));

  var mediaPostData;

  async.waterfall(
    [
      postMedia,
      postMetadata,
      postTweet
    ],
    allDone
  );

  function postMedia(done) {
    var mediaPostOpts = {
      file_path: __dirname + '/' + filename 
    };
    twit.postMediaChunked(mediaPostOpts, done);
  }

  function postMetadata(theMediaPostData, response, done) {
    console.log('Posted media for', altText, JSON.stringify(theMediaPostData));

    // Save this for other functions in the above scope.
    mediaPostData = theMediaPostData;

    var metaParams = {
      media_id: mediaPostData.media_id_string,
      alt_text: {
        text: altText
      }
    };
    twit.post('media/metadata/create', metaParams, done);
  }

  // https://dev.twitter.com/rest/reference/post/media/metadata/create
  // metaDataPostData will be empty if the metadata post was sucessful!
  function postTweet(metaDataPostData, response, done) {
    console.log('Successfully posted metadata. Now posting tweet for', altText);

    var body = {
      status: caption,
      media_ids: [
        mediaPostData.media_id_string
      ]
    };
    if (in_reply_to_status_id) {
      body.in_reply_to_status_id = in_reply_to_status_id;
    }

    if (dryRun) {
      console.log('Would have tweeted: using', JSON.stringify(body, null, '  '));
      callNextTick(done);
    }
    else {
      twit.post('statuses/update', body, done);
    }
  }
}

module.exports = postImage;
