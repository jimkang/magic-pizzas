#!/usr/bin/env node

var config = require('./config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var behavior = require('./behavior');
var shouldReplyToTweet = require('./should-reply-to-tweet');
var level = require('level');
var Sublevel = require('level-sublevel');
var probable = require('probable');
var pathExists = require('object-path-exists');
var postImage = require('./post-image');
var getImageFromConcepts = require('./get-image-from-concepts');
var getPizzaGif = require('./get-pizza-gif');
var saveWordForUser = require('./save-word-for-user');
var getInterestingWords = require('./get-interesting-words');
var Nounfinder = require('nounfinder');
var getImageFromConcepts = require('./get-image-from-concepts');
var saveWordForUser = require('./save-word-for-user');
var postPizzaGif = require('./post-pizza-gif');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var db = Sublevel(level(__dirname + '/data/magic-pizzas-responses.db'));
var lastReplyDates = db.sublevel('last-reply-dates');
var nounfinder = Nounfinder({
  wordnikAPIKey: config.wordnikAPIKey
});

var username = behavior.twitterUsername;

var twit = new Twit(config.twitter);
var streamOpts = {
  replies: 'all'
};
var stream = twit.stream('user', streamOpts);

stream.on('tweet', respondToTweet);
stream.on('error', logError);

function respondToTweet(incomingTweet) {
  async.waterfall(
    [
      checkIfWeShouldReply,
      getImageConceptFromTweet,
      getPizzaGif,
      postPizzaReply,
      recordThatReplyHappened
    ],
    wrapUp
  );

  function checkIfWeShouldReply(done) {
    var opts = {
      tweet: incomingTweet,
      lastReplyDates: lastReplyDates
    };
    shouldReplyToTweet(opts, done);
  }  

  function getImageConceptFromTweet(done) {
    var imageConcept = {};
    var photo;
    if (pathExists(incomingTweet, ['entities', 'media'])) {
      var media = incomingTweet.entities.media;
      if (media.length > 0) {
        var photos =  media.filter(isPhoto);
        photo = probable.pickFromArray(photos);
      }
    }

    if (photo && probable.roll(100) === 0) {
      imageConcept.imgurl = photo.media_url;

      if (photo.sizes && 'medium' in photo.sizes) {
        imageConcept.width = photo.sizes.medium.w;
        imageConcept.height = photo.sizes.medium.h;
      }

      imageConcept.concept = 'image'; // TODO: Get real alt text, if available.
      callNextTick(done, null, imageConcept);
    }
    else {
      getImageFromText(done);
    }
  }

  function getImageFromText(done) {
    async.waterfall(
      [
        getWords,
        getImageFromConcepts,
        recordUseOfWord
      ],
      done
    );

    function getWords(getWordsDone) {
      // Once in a while, just use the entire tweet as one "word" to search for.
      if (probable.roll(4) === 0) {
        var tweetTextWithoutUsername = incomingTweet.text.replace('@' + username, '');
        callNextTick(getWordsDone, null, [tweetTextWithoutUsername]);
      }
      else {
        var opts = {
          text: incomingTweet.text,
          username: incomingTweet.user.screen_name,
          maxCommonness: behavior.maxCommonness,
          sublevelDb: db,
          nounfinder: nounfinder
        };

        getInterestingWords(opts, getWordsDone);
      }
    }

    function recordUseOfWord(imageConcept, recordDone) {
      var saveOpts = {
        word: imageConcept.concept,
        username: incomingTweet.user.screen_name,
        sublevelDb: db
      };
      saveWordForUser(saveOpts, passConcept);

      function passConcept(error) {
        recordDone(error, imageConcept);
      }
    }
  }

  function postPizzaReply(linkResult, done) {
    var postPizzaOpts = {
      twit: twit,
      dryRun: dryRun,
      filename: linkResult.filename,
      concept: linkResult.concept,
      toScreenName: incomingTweet.user.screen_name,
      in_reply_to_status_id: incomingTweet.id_str
    };

    postPizzaGif(postPizzaOpts, done);
  }

  function recordThatReplyHappened(tweetData, response, done) {
    console.log('Put:', incomingTweet.user.id_str);

    lastReplyDates.put(incomingTweet.user.id_str, tweetData.created_at, done);
  }
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
}

function logError(error) {
  console.log(error);
}

function isPhoto(medium) {
  return medium.type === 'photo';
}
