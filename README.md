# persist-it
<!-- badge -->
[![LICENSE](https://img.shields.io/github/license/victornpb/persist-it?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/node/v/persist-it.svg?style=flat-square)](package.json)
[![CodeFactor](https://www.codefactor.io/repository/github/victornpb/persist-it/badge?style=flat-square)](https://www.codefactor.io/repository/github/victornpb/persist-it)

[![Coverage Status](https://img.shields.io/coveralls/victornpb/persist-it.svg?style=flat-square)](https://coveralls.io/github/victornpb/persist-it)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/victornpb/persist-it?style=flat-square)

[![Version](https://img.shields.io/npm/v/persist-it.svg?style=flat-square)](https://www.npmjs.com/package/persist-it)
[![Downloads](https://img.shields.io/npm/dt/persist-it.svg?style=flat-square)](https://www.npmjs.com/package/persist-it)
[![](https://img.shields.io/bundlephobia/minzip/persist-it?style=flat-square)](https://www.npmjs.com/package/persist-it)
[![](https://img.shields.io/tokei/lines/github/victornpb/persist-it?style=flat-square)](https://www.npmjs.com/package/persist-it)

[![GitHub Stars](https://img.shields.io/github/stars/victornpb/persist-it?style=flat-square)](https://github.com/victornpb/persist-it/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/victornpb/persist-it?style=flat-square)](https://github.com/victornpb/persist-it/network/members)
[![GitHub Discussions](https://img.shields.io/github/discussions/victornpb/persist-it?style=flat-square)](https://github.com/victornpb/persist-it/discussions)
[![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/victornpb/persist-it?style=flat-square&color=green)](https://github.com/victornpb/persist-it/pulls?q=is%3Apr+is%3Aclosed)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/victornpb/persist-it?style=flat-square&color=green)](https://github.com/victornpb/persist-it/issues?q=is%3Aissue+is%3Aclosed)
<!-- endbadge -->


Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla non erat non enim ultricies cursus. Nullam quis tortor vel ex aliquet luctus. Aliquam erat volutpat. Donec quis libero lacus. Fusce quis leo vitae purus convallis luctus sed a ex. Phasellus vel mauris in ante bibendum efficitur. Nunc eget dictum purus. Proin vel lectus euismod, blandit nunc in, aliquam quam.

# Usage Examples
Inside your code you can do something like this:

## Basic usage
```js
import PersistIt from 'persist-it';

// us
PersistIt();
```

# Installation

## [NPM](https://npmjs.com/package/persist-it)
```sh
npm install persist-it
```
## [Yarn](https://github.com/yarnpkg/yarn)
```sh
yarn add --dev persist-it
```

# Adding to your project

#### index.js
```js
import PersistIt from 'persist-it';

// setup
import PersistIt from 'persist-it';

fobar.init({options});
```

## Options

PersistIt(variables, options)

| Parameters  | Description           | Type    | Default Value |
|-------------|-----------------------|---------|---------------|
| `foo`       | This is the foo thing | object  | `{}`          |
| `enable`    | Enable the thing      | boolean | `true`        |
| `options.x` | The X value           | number  | `1.0`         |
| `options.y` | The X value           | number  | `2.0`         |
| `options.z` | The X value           | number  | `3.0`         |


### Options example
```js
import PersistIt from 'persist-it';

fobar.init({
  enable: true,
});
```

## License

The code is available under the [MIT](LICENSE) license.

## Contributing

We are open to contributions, see [CONTRIBUTING.md](CONTRIBUTING.md) for more info.

You need at least Node 18 to build the project
