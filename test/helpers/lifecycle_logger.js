
module.exports = function() {

  'use strict'

  var entries = [],
      logger = function(lifecycle) {
        var entry = {
              event:      lifecycle.event,
              transition: lifecycle.transition,
              from:       lifecycle.from,
              to:         lifecycle.to,
              current:    lifecycle.fsm.state
            }
        if (arguments.length > 1)
          entry.args = [].slice.call(arguments, 1);
        entries.push(entry);
      };

  logger.clear = function() {
    entries.length = 0;
  }

  logger.log = entries;

  return logger;
}
