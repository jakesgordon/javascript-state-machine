// Ava doesn't appear to be able to run a single test (that I've found),
// which makes it pretty hard to debug a single test
//
// Use this to run a single test as follows:
//
//   node_modules/ava/cli.js test/singletest.js
//
// Copy and paste the test code after the 'test body' section
//
// 10-Nov-2017 -- rickb
//
import test         from 'ava'
import StateMachine from '../src/app'
import visualize    from '../src/plugin/visualize'
import {PFXSTR,PFXOBJ} from './imports/dotprefix'


/** test body - paste test function in here */