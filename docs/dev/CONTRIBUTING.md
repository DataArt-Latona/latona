# Contributing to Latona

## Filing issues

### Report bugs using Github's issues

We use GitHub issues to track public bugs. Report a bug by opening a new issue -
that is a great way to contribute. Please consider some guidelines that will
help us to understand what happened:

- Include as much detail as you can be about the problem
- Point to a test repository that can help reproduce the issue.
- Github supports markdown, so when filing bugs make sure you check the
  formatting before submitting.
- Respect our [Code of Conduct](../../CODE_OF_CONDUCT.md)

## Contributing code

### Development Workflow

All ongoing development happens in the `develop` branch. We apply extra efforts
to make sure that all repos for the Latona are in sync and all our extensions
are compatible. Thus, all pull requests from contributors should be submitted to
the `develop` branch.

### Prerequisites

Download and install:

1. Any git client
1. [Node JS](https://nodejs.org/en/)
1. [VS Code](https://code.visualstudio.com/) is the recommended editor, though
   you can use what works best for you.

### Setup the environment

We welcome your pull requests for all repos of the Latona family.

1. [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)
   the repo and create your branch from `develop`.
1. Clone your fork locally
1. Run `npm install` to install dependencies.

### Project folder structure

- `docs` - detailed documentation
- `examples` - sample configurations, templates, and with auxiliary files
- `src` - Latona core source code
- `test` - unit tests

Ignored local folders:

- /node_modules
- /logs - some test logs may land hear
- /test/output - used to render test output, we do our best to keep it clean
- /coverage - test coverage reports (if you run that)

### Coding guidelines

- 2 spaces for indentation rather than tabs
- Run `npm test` to make sure all test suites pass
- Run `npm run lint` to conform to our lint rules
- formatting: 'Prettier' ([plugin for VS Code](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode))
- linting: 'ESLint' ([plugin for VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint))
  - [airbnb base config](https://www.npmjs.com/package/eslint-config-airbnb-base)
  - [eslint + prettier config](https://www.npmjs.com/package/eslint-config-prettier)

### Running the tests

We use [mocha](https://github.com/mochajs/mocha) javascript test framework
together with [chai](https://github.com/chaijs/chai) BDD / TDD assertion
framework in order to build and run unit tests for Latona. All of them are
placed in `./test` folder. The structure of files in the tests directory is
absolutely identical to project's structure. It means if you are looking for
tests for `./src/utils/io.js` file, you will find it at the same path in tests
folder: `./test/src/utils/io.spec.js`. The only difference is that the test
file has `*.spec.*` extension in its name.

For better development experience we recommend using some of VS Code plugins.
Ex.: 'Mocha sidebar' ([plugin for VS Code](https://github.com/maty21/mocha-sidebar)).

In order to run all tests use npm script:

```
npm run test
```

We monitor the test coverage with [istanbuljs/nyc](https://github.com/istanbuljs/nyc).
Run this npm-script to generate reports:

```
npm run coverage
```

Reports in HTML format will land at the `/coverage` folder.

### Submitting Pull Requests

1. If you've added code that should be tested, add tests.
1. If you've changed APIs, update the documentation.
1. Ensure the test suite passes.
1. Make sure your code lints.
1. Commit and push. Make sure you provide meaningful details about your change.
1. Issue your pull request. Make sure you provide a detailed description of what
   was changed and why; referencing the issue number is a must!

### Any contributions you make will be under the Apache License, Version 2.0

Your submitted code changes are implied to be under the same [Apache License
(Version 2.0)](/LICENSE.md) that covers the project. Feel free to contact the
maintainers if that's a concern.
