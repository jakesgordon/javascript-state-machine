'use strict'

module.exports = function(message, transition, from, to, current) {
  this.message    = message;
  this.transition = transition;
  this.from       = from;
  this.to         = to;
  this.current    = current;
}
