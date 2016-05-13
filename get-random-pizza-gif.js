var async = require('async');
var getImageFromConcepts = require('./get-image-from-concepts');
var getPizzaGif = require('./get-pizza-gif');
var createWordnok = require('wordnok').createWordnok;
var pluck = require('lodash.pluck');
var probable = require('probable');

function getRandomPizzaGif(opts, allDone) {
  var twit;
  var config;

  if (opts) {
    twit = opts.twit;
    config = opts.config;
  }

  var wordnok = createWordnok({
    apiKey: config.wordnikAPIKey
  });

  async.waterfall(
    [
      getConcepts,
      getImageFromConcepts,
      getPizzaGif
    ],
    allDone
  );

  function getConcepts(done) {
    var opts = {
      customParams: {
        limit: 5
      }
    };
    wordnok.getRandomWords(opts, done);
  }
}

module.exports = getRandomPizzaGif;
