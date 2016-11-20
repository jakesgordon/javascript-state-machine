
      FUTURE Version 3.0.0 (ETA - Early 2017)
      ------------------------------

      I know, I know, I've neglected this library for far too long, so lets get it back on track before the end of 2016...

        ADD: Promise based async transitions
        ADD: conditional transitions
        ADD: observable transitions 
        ADD: composable state machines
        ADD: better introspection
        ADD: undo/redo history
        ADD: use camel casing for callback/observer methods (instead of all lower case)
 
Version 2.4.0 (ETA - November 2016)
-----------------------------------

 * added npm install instructions to readme
 * fix for javascript error when running in jasmine/node (issue #88)
 * exclude build files from bower install (pull request #75)
 * ensure WILDCARD events are included in list of available transitions() (issue #93)
 * fix FSM getting stuck into "*" state when using double wildcard (issue #64)
 * function (fsm.states) returning list of all available states in the machine would help automated testing (issue #54)
 * state machine hides callback exceptions (issue #62)
 * replaced (dev dependency) YUI compressor with uglify-js for building minified version

Version 2.3.5 (January 20 2014)
-------------------------------

 * fix for broken transitions() method (issue #74)

Version 2.3.4 (January 17 2014)
-------------------------------

 * helper method to list which events are allowed from the current state (issue #71 - thanks to @mgoldsborough and @chopj)

Version 2.3.3 (October 17 2014)
-------------------------------

 * added web worker compatability (issue #65 - thanks to @offirmo)

Version 2.3.2 (March 16 2014)
-----------------------------

 * had to bump the version number after messing up npmjs.org package registration

Version 2.3.0 (March 15 2014)
-----------------------------

 * Added support for bower
 * Added support for nodejs (finally)
 * Added ability to run tests in console via nodejs ("npm install" to get node-qunit, then "node test/runner.js")

Version 2.2.0 (January 26th 2013)
---------------------------------
 
 * Added optional `final` state(s) and `isFinished()` helper method (issue #23)
 * extended `fsm.is()` to accept an array of states (in addition to a single state)
 * Added generic event callbacks 'onbeforeevent' and 'onafterevent' (issue #28)
 * Added generic state callbacks 'onleavestate' and 'onenterstate'  (issue #28)
 * Fixed 'undefined' event return codes (issue #34) - pull from gentooboontoo (thanks!)
 * Allow async event transition to be cancelled (issue #22)
 * [read more...](http://codeincomplete.com/posts/2013/1/26/javascript_state_machine_v2_2_0/)

Version 2.1.0 (January 7th 2012)
--------------------------------

 * Wrapped in self executing function to be more easily used with loaders like `require.js` or `curl.js` (issue #15)
 * Allow event to be cancelled by returning `false` from `onleavestate` handler (issue #13) - WARNING: this breaks backward compatibility for async transitions (you now need to return `StateMachine.ASYNC` instead of `false`)
 * Added explicit return values for event methods (issue #12)
 * Added support for wildcard events that can be fired 'from' any state (issue #11)
 * Added support for no-op events that transition 'to' the same state  (issue #5)
 * extended custom error callback to handle any exceptions caused by caller provided callbacks
 * added custom error callback to override exception when an illegal state transition is attempted (thanks to cboone)
 * fixed typos (thanks to cboone)
 * fixed issue #4 - ensure before/after event hooks are called even if the event doesn't result in a state change 

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
