//-----------------------------------------------------------------------------

module("special initialization options", {

  setup: function() {
    this.called = [];
    this.onbeforeinit    = function() { this.called.push("onbeforeinit");    };
    this.onafterinit     = function() { this.called.push("onafterinit");     };
    this.onbeforestartup = function() { this.called.push("onbeforestartup"); };
    this.onafterstartup  = function() { this.called.push("onafterstartup");  };
    this.onbeforepanic   = function() { this.called.push("onbeforepanic");   };
    this.onafterpanic    = function() { this.called.push("onafterpanic");    };
    this.onbeforecalm    = function() { this.called.push("onbeforecalm");    };
    this.onaftercalm     = function() { this.called.push("onaftercalm");     };
    this.onenternone     = function() { this.called.push("onenternone");     };
    this.onentergreen    = function() { this.called.push("onentergreen");    };
    this.onenterred      = function() { this.called.push("onenterred");      };
    this.onleavenone     = function() { this.called.push("onleavenone");     };
    this.onleavegreen    = function() { this.called.push("onleavegreen");    };
    this.onleavered      = function() { this.called.push("onleavered");      };
  }

});

//-----------------------------------------------------------------------------

test("initial state defaults to 'none'", function() {
  StateMachine.create({
    target: this,
    events: [
      { name: 'panic', from: 'green', to: 'red'   },
      { name: 'calm',  from: 'red',   to: 'green' }
  ]});
  equal(this.current, 'none');
  deepEqual(this.called,  []);
});

//-----------------------------------------------------------------------------

test("initial state can be specified", function() {
  StateMachine.create({
    target: this,
    initial: 'green',
    events: [
      { name: 'panic', from: 'green', to: 'red'   },
      { name: 'calm',  from: 'red',   to: 'green' }
  ]});
  equal(this.current, 'green');
  deepEqual(this.called, ["onbeforestartup", "onleavenone", "onentergreen", "onafterstartup"]);
});

//-----------------------------------------------------------------------------

test("startup event name can be specified", function() {
  StateMachine.create({
    target: this,
    initial: { state: 'green', event: 'init' },
    events: [
      { name: 'panic', from: 'green', to: 'red'   },
      { name: 'calm',  from: 'red',   to: 'green' }
  ]});
  equal(this.current, 'green');
  deepEqual(this.called, ["onbeforeinit", "onleavenone", "onentergreen", "onafterinit"]);
});

//-----------------------------------------------------------------------------

test("startup event can be deferred", function() {
  StateMachine.create({
    target: this,
    initial: { state: 'green', event: 'init', defer: true },
    events: [
      { name: 'panic', from: 'green', to: 'red'   },
      { name: 'calm',  from: 'red',   to: 'green' }
  ]});
  equal(this.current, 'none');
  deepEqual(this.called, []);

  this.init();

  equal(this.current, 'green');
  deepEqual(this.called, ["onbeforeinit", "onleavenone", "onentergreen", "onafterinit"]);
});

//-----------------------------------------------------------------------------


