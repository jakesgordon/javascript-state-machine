var StateMachine = require('../src/app'),
    visualize    = require('../src/plugin/visualize');

var ATM = StateMachine.factory({
  init: 'ready',
  transitions: [
    { name: 'insert-card', from: 'ready',                     to: 'pin'               },
    { name: 'confirm',     from: 'pin',               to: 'action'             },
    { name: 'reject',      from: 'pin',               to: 'return-card'               },
    { name: 'withdraw',    from: 'return-card',               to: 'ready'                     },

    { name: 'deposit',     from: 'action',             to: 'deposit-account'    },
    { name: 'provide',     from: 'deposit-account',    to: 'deposit-amount'     },
    { name: 'provide',     from: 'deposit-amount',     to: 'confirm-deposit'    },
    { name: 'confirm',     from: 'confirm-deposit',    to: 'collect-envelope'          },
    { name: 'provide',     from: 'collect-envelope',          to: 'continue'                  },

    { name: 'withdraw',    from: 'action',             to: 'withdrawal-account' },
    { name: 'provide',     from: 'withdrawal-account', to: 'withdrawal-amount'  },
    { name: 'provide',     from: 'withdrawal-amount',  to: 'confirm-withdrawal' },
    { name: 'confirm',     from: 'confirm-withdrawal', to: 'dispense-cash'             },
    { name: 'withdraw',    from: 'dispense-cash',             to: 'continue'                  },

    { name: 'continue',    from: 'continue',                  to: 'action'             },
    { name: 'finish',      from: 'continue',                  to: 'return-card'               }
  ]
})

ATM.visualize = function() {
  return visualize(ATM, { name: 'ATM' })
}

module.exports = ATM
