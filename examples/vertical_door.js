var StateMachine = require('../src/app'),
    visualize    = require('../src/plugin/visualize');

var Door = StateMachine.factory({
  init: 'closed',
  transitions: [
    { name: 'open',  from: 'closed', to: 'open'   },
    { name: 'close', from: 'open',   to: 'closed' }
  ]
});

Door.visualize = function() {
  return visualize(Door)
}

module.exports = Door
