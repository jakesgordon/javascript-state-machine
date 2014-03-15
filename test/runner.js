//
// To run tests via nodejs you must have nodejs and npm installed
//
//  > npm install      # to install node-qunit
//  > node test/runner
//

var runner = require("qunit");

runner.run({

  code: "./state-machine.js",

  tests: [
    "test/test_basics.js",
    "test/test_advanced.js",
    "test/test_classes.js",
    "test/test_async.js",
    "test/test_initialize.js"
  ]

});
