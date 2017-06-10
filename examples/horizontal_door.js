var StateMachine = require('../src/app'),
    visualize    = require('../src/plugin/visualize');

var Door = StateMachine.factory({
  init: 'closed',
  transitions: [
    { name: 'open',  from: 'closed', to: 'open',   dot: { color: 'blue', headport: 'n', tailport: 'n' } },
    { name: 'close', from: 'open',   to: 'closed', dot: { color: 'red',   headport: 's', tailport: 's' } }
  ]
});

Door.visualize = function() {
  return visualize(Door, { name: 'door', orientation: 'horizontal' })
}

module.exports = Door
