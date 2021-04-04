# Latona

![unit tests & CI/CD](https://github.com/dataart-latona/latona/actions/workflows/push_main.yml/badge.svg)

Latona is the DW/BI solution accelerator which simplifies model-based code
generation.

With this project, we're building a tool that allows generating all code
artifacts required to spin off an end-to-end data warehouse/data platform.
Such artifacts might include:

- Database projects (staging and public areas of a DW)
- ETL code for the selected technology
- MPP artifacts
- Model documentation
- Any other thing that can be templated

We believe that code generation should be driven by a data model containing a
list of tables, fields and some metadata.

## Quick start

### Prerequisites

Download and install:

- [Node JS](https://nodejs.org/en/)

### Install

1. Use `npm` to crate a `package.json` file for yor project (see [npm documentation](https://docs.npmjs.com/cli/v7/commands/npm-init) for more details):

```
npm init
```

2. Use `npm` to install latona from the repo (**note**: the path to the package will change as soon as we're done with moving to opensource and packaging is up and running):

```
npm install -g latona
npm link
```

3. Use `npm` to install required addon packages (refer to [this page](./docs/addons/addon-registry.md) for the complete list), for example:

```
npm install <package-name>
```

### Use

1. Create new model and project:

```
latona new model
latona new project
```

2. Adjust model content and project settings as needed - read [this tutorial](./docs/Usage.md) to get more details

3. Validate your project:

```
latona validate
```

4. Render your artifacts:

```
latona render
```

## Detailed documentation

To learn more about Latona internals (including key concepts, API reference,
extensions development guidelines) please visit [this page](./docs/README.md).

## Built With

- [Mustache JS](https://github.com/janl/mustache.js/) - Templates framework
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - Node.js: extra
  methods for the fs object like copy(), remove(), mkdirs()
- [winston](https://github.com/winstonjs/winston) - A logger for just about
  everything.
- [mocha](https://github.com/mochajs/mocha) - Simple, flexible, fun javascript
  test framework for node.js & the browser
- [chai](https://github.com/chaijs/chai) - BDD / TDD assertion framework for
  node.js and the browser that can be paired with any testing framework.

## Contributing

Please read our [contribution guidelines](./docs/dev/CONTRIBUTING.md) for
details on our development approach, and the process for submitting pull
requests to us. All contributors should comply with our
[Code of Conduct](./CODE_OF_CONDUCT.md)

## License

**Latona** is copyright (c) 2019-present DataArt (www.dataart.com) and all
contributors and licensed under the Apache License, Version 2.0.
See the [LICENSE](./LICENSE) file for more details.
