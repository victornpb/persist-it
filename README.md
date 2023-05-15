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

"persist-it" is a Node.js library that provides a flexible and easy-to-use persistence solution for storing key-value pairs in a persistent storage system. It allows you to store and retrieve data persistently, making it suitable for various use cases where persistent data storage is required.

# Features

- Store key-value pairs persistently
- Create separate storage instances for general use or app-specific use
- Ability to initialize storage with customizable options
- Automatic caching of frequently accessed data for improved performance
- Asynchronous API using Promises for non-blocking operations

# Installation

You can install "persist-it" via npm or yarn. Run the following command to install it:

## [NPM](https://npmjs.com/package/persist-it)
```sh
npm install persist-it
```
## [Yarn](https://github.com/yarnpkg/yarn)
```sh
yarn add --dev persist-it
```

# Adding to your project

There are 3 ways to include and use it in your project, most projects will only use the first way (singleton instance).

### Singleton Instance
For easy of use persist-it provides an instance that you can initialize once and can be imported/required anywhere.
```js
import { persistIt } from 'persist-it';
persistIt.init({ directory: 'user', appName: 'MyApp' }); // init once in your app

// use it anywhere
persistIt.set('namespace', {x:1,y:[1,2,3]});
persistIt.setValue('namespace', 'foo.bar', 'value');
const result = await persistIt.getValue('namespace', 'foo.bar');
console.log(result);
```

### Storage for App
You can still create your own instances if you need multiple scoped instances, or just want to have more control of life cycle. Each instance keeps its own caching.
```js
import { PersistItApp } from 'persist-it';

const appStorage = new PersistItApp();
appStorage.init({ directory: 'user', appName: 'MyApp' });
appStorage.set('key', 'value');
const result = appStorage.get('key');
console.log(result); // Output: value
```

### General Storage
If you don't need the multiplatform, appDirs directory resolution, or automatically determine the name, author, and version. You can create your own general purpose storagge instance directly, just passing a specific path to where to store files.
```js
import { PersistIt } from 'persist-it';

const storage = new PersistIt('~/custom/dir/foo');

storage.set('namespace', {x:1,y:[1,2,3]});
storage.setValue('namespace', 'foo.bar', 'value');
const result = await storage.getValue('namespace', 'foo.bar');
console.log(result);
```

## Options

- **directory**: Specifies the mode for selecting the storage location (`user` | `shared` | `custom`).
- **path**: The path to use when the directory is set to `custom`.
- **appName**: The custom app name (defaults to package.json name).
- **appAuthor**: The custom app author (defaults to package.json author).
- **appVersion**: The version to append (defaults to package.json major version `v#`). Set to `false` to disable versioning.
- **folder**: The folder name inside the directory.
- **readPackageJson**: Specifies whether to attempt to determine `appName`, `appAuthor`, and `appVersion` from `package.json`.
- **preload**: Preloads data from disk to memory during initialization.

# Methods

## Initialization

### init(options: InitializationOptions): void

Initializes the persistence mechanism with the specified options.

- `options`: An object containing the initialization options.
  - `directory` (string, required): The directory where the data will be stored.
  - `preload` (boolean, optional, default: true): Determines whether to preload data from disk to memory during initialization.

Throws an error if the `directory` option is not specified.

## Asynchronous Methods

### get(key: string): Promise<any>

Retrieves the value associated with the specified `key` from the persistence mechanism.

- `key` (string): The key to retrieve the value for.

Returns a Promise that resolves to the value associated with the key. If the key is not found, `undefined` is returned.

### set(key: string, value: any): Promise<void>

Sets a `value` for the specified `key` in the persistence mechanism.

- `key` (string): The key to set.
- `value` (any): The value to associate with the key.

Returns a Promise that resolves once the value is successfully set.

### delete(key: string): Promise<void>

Deletes the key-value pair associated with the specified `key` from the persistence mechanism.

- `key` (string): The key to delete.

Returns a Promise that resolves once the key-value pair is successfully deleted.

### getValue(key: string, path: string, defaultValue?: any): Promise<any>

Retrieves a nested value from an object stored with the specified `key` in the persistence mechanism.

- `key` (string): The key to retrieve the object from.
- `path` (string): The path to the nested value within the object.
- `defaultValue` (any, optional): The default value to return if the nested value is not found.

Returns a Promise that resolves to the retrieved nested value or the `defaultValue` if the nested value is not found.

### setValue(key: string, path: string, value: any): Promise<void>

Sets a nested `value` within an object stored with the specified `key` in the persistence mechanism.

- `key` (string): The key to retrieve the object from.
- `path` (string): The path to the nested value within the object.
- `value` (any): The value to set for the nested path.

Returns a Promise that resolves once the nested value is successfully set.

### flush(): Promise<void>

Writes any pending changes in the write queue to the persistent storage.

Returns a Promise that resolves once the pending changes are successfully written.

## Synchronous Methods

The synchronous methods provide the same functionality as their asynchronous counterparts but operate synchronously without returning Promises. These methods are suitable for cases where synchronous execution is desired.

### getSync(key: string): any

Retrieves the value associated with the specified `key` from the persistence mechanism synchronously.

- `key` (string): The key to retrieve the value for.

Returns the value associated with the key. If the key is not found, `undefined` is returned.

### setSync(key: string, value: any): void

Sets a `value` for the specified `key` in the persistence mechanism synchronously.

- `key` (string): The key to set.
- `value` (any): The value to associate with the key.

### deleteSync(key: string): void

Deletes the key-value pair associated with the specified `key` from the persistence mechanism synchronously.

- `key` (string): The key to delete.

### getValueSync(key: string, path: string): any

Retrieves a nested valuefrom an object stored with the specified `key` in the persistence mechanism synchronously.

- `key` (string): The key to retrieve the object from.
- `path` (string): The path to the nested value within the object.

Returns the retrieved nested value or `undefined` if the nested value is not found.

### setValueSync(key: string, path: string, value: any): void

Sets a nested `value` within an object stored with the specified `key` in the persistence mechanism synchronously.

- `key` (string): The key to retrieve the object from.
- `path` (string): The path to the nested value within the object.
- `value` (any): The value to set for the nested path.

### flushSync(): void

Writes any pending changes in the write queue to the persistent storage synchronously.

----------

## Contributing

Contributions to "persist-it" are welcome! If you find any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request.

Before contributing, please make sure to read the [CONTRIBUTING.md](CONTRIBUTING.md).


## License

The code is available under the [MIT](LICENSE) license.
