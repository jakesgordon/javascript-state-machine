
Version 2.0.0 (August 19th 2011)
--------------------------------

 * adding support for asynchronous state transitions (see README) - with lots of qunit tests (see test/async.js).
 * consistent arguments for ALL callbacks, first 3 args are ALWAYS event name, from state and to state, followed by whatever arguments the user passed to the original event method.
 * added a generic `onchangestate(event,from,to)` callback to detect all state changes with a single function.
 * allow callbacks to be declared at creation time (instead of having to attach them afterwards)
 * renamed 'hooks' => 'callbacks'
 * [read more...](http://codeincomplete.com/posts/2011/8/19/javascript_state_machine_v2/)

Version 1.2.0 (June 21st 2011)
------------------------------
 * allows the same event to transition to different states, depending on the current state (see 'Multiple...' section in README.md)
 * [read more...](http://codeincomplete.com/posts/2011/6/21/javascript_state_machine_v1_2_0/)

Version 1.0.0 (June 1st 2011)
-----------------------------
 * initial version
 * [read more...](http://codeincomplete.com/posts/2011/6/1/javascript_state_machine/)
