var { StateMachine, plugins } = require('../dist/cjs');
var  visualize = plugins.visualize;

var Door = StateMachine.factory({
  init: 'closed',
  transitions: [
    { name: 'open',  from: 'closed', to: 'open',   dot: { color: 'blue', headport: 'n', tailport: 'n' } },
    { name: 'close', from: 'open',   to: 'closed', dot: { color: 'red',   headport: 's', tailport: 's' } }
  ]
});

Door.prototype.visualize = function() {
  return visualize(this, { name: 'door', orientation: 'horizontal' })
}

module.exports = Door
