var { StateMachine, plugins } = require('../dist/cjs');
var  visualize = plugins.visualize;

var Door = StateMachine.factory({
  init: 'closed',
  transitions: [
    { name: 'open',  from: 'closed', to: 'open'   },
    { name: 'close', from: 'open',   to: 'closed' }
  ]
});

Door.prototype.visualize = function() {
  return visualize(this)
}

module.exports = Door
