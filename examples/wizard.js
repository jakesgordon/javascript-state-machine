var StateMachine = require('../src/app'),
    visualize    = require('../src/plugin/visualize');

var Wizard = StateMachine.factory({
  init: 'A',
  transitions: [
    { name: 'step',  from: 'A',               to: 'B', dot: { headport: 'w',  tailport: 'ne' } },
    { name: 'step',  from: 'B',               to: 'C', dot: { headport: 'w',  tailport: 'e' } },
    { name: 'step',  from: 'C',               to: 'D', dot: { headport: 'w',  tailport: 'e' } },
    { name: 'reset', from: [ 'B', 'C', 'D' ], to: 'A', dot: { headport: 'se', tailport: 's' } }
  ]
});

Wizard.visualize = function() {
  return visualize(Wizard, { name: 'wizard', orientation: 'horizontal' })
}

module.exports = Wizard
