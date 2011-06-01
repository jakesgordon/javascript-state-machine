
//-----------------------------------------------------------------------------

module("basic", {
  setup: function() {
    StateMachine.create({
      target: this,
      state: 'green',
      events: [
        { name: 'warn',  from: 'green',             to: 'yellow' },
        { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
        { name: 'calm',  from: 'red',               to: 'yellow' },
        { name: 'clear', from: ['red',   'yellow'], to: 'green'  },
    ]});
  }
});

//-----------------------------------------------------------------------------

test("events", function() {

  equals(this.current, 'green', "initial state should be green");

  this.warn();  equals(this.current, 'yellow', "warn  event should transition from green  to yellow");
  this.panic(); equals(this.current, 'red',    "panic event should transition from yellow to red");
  this.calm();  equals(this.current, 'yellow', "calm  event should transition from red    to yellow");
  this.clear(); equals(this.current, 'green',  "clear event should transition from yellow to green");
                                    
  this.panic(); equals(this.current, 'red',    "panic event should transition from green  to red");
  this.clear(); equals(this.current, 'green',  "clear event should transition from red    to green");
                                     
  this.warn();  equals(this.current, 'yellow', "warn  event should transition from green  to yellow");
  this.clear(); equals(this.current, 'green',  "clear event should transition from yellow to green");

});

//-----------------------------------------------------------------------------

test("innapropriate events", function() {

  equals(this.current, 'green', "initial state should be green");

  raises(this.calm.bind(this),  /event calm innapropriate in current state green/);
  raises(this.clear.bind(this), /event clear innapropriate in current state green/);

  this.warn();
  equals(this.current, 'yellow', "current state should be yellow");

  raises(this.warn.bind(this), /event warn innapropriate in current state yellow/);
  raises(this.calm.bind(this), /event calm innapropriate in current state yellow/);

  this.panic();
  equals(this.current, 'red', "current state should be red");

  raises(this.warn.bind(this),  /event warn innapropriate in current state red/);
  raises(this.panic.bind(this), /event panic innapropriate in current state red/);

});

//-----------------------------------------------------------------------------

test("cancel event", function() {

  equal(this.current, 'green', 'initial state should be green');

  this.onbeforewarn = function() { return false; } 
  this.warn();

  equal(this.current, 'green', 'state should STAY green when event is cancelled');

});

//-----------------------------------------------------------------------------

test("can", function() {

  equals(this.current, 'green', "initial state should be green");

  ok(this.can('warn'),     "should be able to warn from green state")
  ok(this.can('panic'),    "should be able to panic from green state")
  ok(this.cannot('calm'),  "should NOT be able to calm from green state")
  ok(this.cannot('clear'), "should NOT be able to clear from green state")

  this.warn();
  equals(this.current, 'yellow', "current state should be yellow");

  ok(this.cannot('warn'),  "should NOT be able to warn from yellow state")
  ok(this.can('panic'),    "should be able to panic from yellow state")
  ok(this.cannot('calm'),  "should NOT be able to calm from yellow state")
  ok(this.can('clear'),    "should be able to clear from yellow state")

  this.panic();
  equals(this.current, 'red',  "current state should be red");

  ok(this.cannot('warn'),  "should NOT be able to warn from red state")
  ok(this.cannot('panic'), "should NOT be able to panic from red state")
  ok(this.can('calm'),     "should be able to calm from red state")
  ok(this.can('clear'),    "should be able to clear from red state")

});

//-----------------------------------------------------------------------------

test("hooks", function() {

  // state hooks
  this.onentergreen    = function() { this.called.push('onentergreen');     };
  this.onleavegreen    = function() { this.called.push('onleavegreen');     };
  this.onenteryellow   = function() { this.called.push('onenteryellow');    };
  this.onleaveyellow   = function() { this.called.push('onleaveyellow');    };
  this.onenterred      = function() { this.called.push('onenterred');       };
  this.onleavered      = function() { this.called.push('onleavered');       };

  // event hooks
  this.onbeforewarn    = function() { this.called.push('onbeforewarn');     };
  this.onafterwarn     = function() { this.called.push('onafterwarn');      };
  this.onbeforepanic   = function() { this.called.push('onbeforepanic');    };
  this.onafterpanic    = function() { this.called.push('onafterpanic');     };
  this.onbeforecalm    = function() { this.called.push('onbeforecalm');     };
  this.onaftercalm     = function() { this.called.push('onaftercalm');      };
  this.onbeforeclear   = function() { this.called.push('onbeforeclear');    };
  this.onafterclear    = function() { this.called.push('onafterclear');     }

  this.called = [];
  this.warn();
  deepEqual(this.called, ['onbeforewarn', 'onleavegreen', 'onenteryellow', 'onafterwarn']);

  this.called = [];
  this.panic();
  deepEqual(this.called, ['onbeforepanic', 'onleaveyellow', 'onenterred', 'onafterpanic']);

  this.called = [];
  this.calm();
  deepEqual(this.called, ['onbeforecalm', 'onleavered', 'onenteryellow', 'onaftercalm']);

  this.called = [];
  this.clear();
  deepEqual(this.called, ['onbeforeclear', 'onleaveyellow', 'onentergreen', 'onafterclear']);

});

//-----------------------------------------------------------------------------

