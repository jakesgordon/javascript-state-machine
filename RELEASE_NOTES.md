
Version 2.0.0 (unreleased)
--------------------------

 * adding support for asynchronous state transitions (see README).
 * consistent arguments for ALL callbacks, first 3 args are ALWAYS event name, from state and to state, followed by whatever arguments the user passed to the original event method.
 * added a generic `onchangestate(event,from,to)` callback to detect all state changes with a single function.

Version 1.2.0 (June 21st 2011)
------------------------------
 * allows the same event to transition to different states, depending on the current state (see 'Multiple...' section in README.md)

Version 1.0.0 (June 1st 2011)
-----------------------------
 * initial version
