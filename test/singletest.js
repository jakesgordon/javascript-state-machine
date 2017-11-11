// Ava doesn't appear to be able to run a single test (that I've found),
// which makes it pretty hard to debug a single test
//
// Use this to run a single test as follows:
//
//   node_modules/ava/cli.js test/singletest.js
//
// Copy and paste the test code into the 'test body' section
//
// 10-Nov-2017 -- rickb
//
import test         from 'ava'
import StateMachine from '../src/app'

/******************************************************
 * uncomment this section if you're including visualize test
 * /
import visualize    from '../src/plugin/visualize'

var dotcfg    = visualize.dotcfg, // converts FSM        to DOT CONFIG
    dotify    = visualize.dotify; // converts DOT CONFIG to DOT OUTPUT

var pfxStr = '\
  graph  [ fontcolor="dimgray", fontname="Helvetica", splines="spline" ];\n\
  node  [ color="dimgray", fontcolor="dimgray", fontname="Helvetica", fontsize="13" ];\n\
  edge  [ fontcolor="dimgray", fontname="Arial", fontsize="10" ];\
';

var pfxObj = { dotPrefix: {
  graph: { fontcolor: 'dimgray',
           fontname: 'Helvetica',
           splines: 'spline' },
  node: { color: 'dimgray',
          fontsize: 13,
          fontcolor: 'dimgray',
          fontname: 'Helvetica' },
  edge: { fontcolor: 'dimgray', fontsize: 10, fontname: 'Arial' }
  }};
********************************************************/

/** test body - paste test function in here */

test('version', t => {
  t.is(StateMachine.version, '3.0.1');
});
