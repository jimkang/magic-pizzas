var getPizzaGif = require('../get-pizza-gif');

if (process.argv.length < 3) {
  console.log('Usage: node tools/run-get-pizza-gif.js <topping image url>');
  process.exit();
}

var imgurl = process.argv[2];

var imageConcept = {
  imgurl: imgurl,
  concept: 'test'
};

getPizzaGif(imageConcept, logResult);

function logResult(error, file) {
  console.log(error, file);
}
