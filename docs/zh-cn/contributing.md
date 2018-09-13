# Contributing

The `javascript-state-machine` library is built using:

  * [Webpack 2](https://webpack.js.org/concepts/) - for bundling javascript modules together
  * [UglifyJS2](https://github.com/mishoo/UglifyJS2) - for minifying bundled javascript files
  * [Ava](https://github.com/avajs/ava) - for testing

The directory structure includes:

```shell
  /bin              # - build scripts
  /dist             # - minified bundles for distribution
  /docs             # - documentation
  /examples         # - example visualizations
  /lib              # - bundled source code for npm
  /src              # - source code
  /test             # - unit tests

  package.json      # - npm configuration
  webpack.config.js # - webpack configuration

  LICENSE           # - the project licensing terms
  README.md         # - the project readme
  RELEASE_NOTES.md  # - the project release notes

```

Build time dependencies can be installed using npm:

```shell
  > npm install
```

A number of npm scripts are available:

```shell
  > npm run test    # run unit tests
  > npm run build   # bundle and minify files for distribution
  > npm run watch   # run tests if source files change
```

## Source Code

The source code is written in es5 syntax and should be supported by all [es5 compatible browsers](http://caniuse.com/#feat=es5).
[Babel](https://babeljs.io/) is **NOT** used for this project. Webpack is used to
bundle modules together for distribution.

## Submitting Pull Requests

Generally speaking, please raise an issue first and lets discuss the problem and the
proposed solution. The next step would be a pull-request - fantastic and thank you for helping out - but
please try to...

  * ensure the tests pass (`npm test`).
  * rebuild distribution files (`npm run build`).
  * include tests for your changes.
  * include documentation for your changes.
  * include a great commit message.
