const logger = require('winston');

/**
 * Function getArrayArthefacts generate the array of arthefact in function of the envelop of the sound
 * Attention if barSize is less than one, the randomNumber generated can be less than 0
 * We can change baseLowerBound and baseUpperBound to modify the base position 
 * @param {array} arraySpectrum array of the spectrum generate by the sound
 */

const getArrayArthefacts = (arraySpectrum) =>{
	logger.debug('Generation of the array of arthefact');
	var randomNumbers = [];
	var baseLowerBound = 1
	var baseUpperBound = 2
	arraySpectrum.forEach(function (barSize) {
	  var lowerBound = baseLowerBound - barSize;
	  var upperBound = baseUpperBound + barSize;
	  var randomNumber = Math.round(Math.random() * (upperBound - lowerBound) + lowerBound);
	  // Yay! new random number
	  randomNumbers.push(randomNumber);
	});
	return randomNumbers;
  }
 
module.exports = getArrayArthefacts