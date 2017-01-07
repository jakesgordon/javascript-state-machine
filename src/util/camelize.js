'use strict'

module.exports = function(label) {
  var n, word, words = label.split(/[_-]/), result = words[0];
  for(n = 1 ; n < words.length ; n++) {
    result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1);
  }
  return result;
}
