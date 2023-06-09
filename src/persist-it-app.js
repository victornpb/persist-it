import defaults from 'default-args';
import * as nodePath from 'path';
// import { DEBUG, PREFIX } from './utils/flags';
import findRoot from './utils/findRoot';
import { getPackageSync } from './utils/getPkg';
import { userDataDir, siteDataDir } from './utils/dirs';
import PersistIt from './persist-it';

/**
 * Options for initializing the PersistIt instance.
 * @typedef {Object} PersistItAppOptions
 * @property {boolean} [preload=true] - Preloads data from disk to memory during initialization.
 * @property {string} [directory='user'] - Specifies the mode for selecting the storage location ('user' | 'shared' | 'custom').
 * @property {string} [path=''] - The path to use when the directory is set to 'custom'.
 * @property {string} [appName] - The custom app name (defaults to package.json name).
 * @property {string} [appAuthor] - The custom app author (defaults to package.json author).
 * @property {(string|boolean)} [appVersion] - The version to append (defaults to package.json major version 'v#'). Set to false to disable versioning.
 * @property {string} [folder='persist'] - The folder name inside the directory.
 * @property {boolean} [readPackageJson=true] - Specifies whether to attempt to determine appName, appAuthor, and appVersion from package.json.
 */
export default class PersistItApp extends PersistIt {

  /**
   * Initializes the PersistIt instance with the specified options.
   * @param {PersistItAppOptions} options - The options for initializing the PersistIt instance.
   * @throws {Error}
   */
  init(options) {

    options = defaults({
      directory: 'user', // Specifies the mode for selecting the storage location (user | shared | custom)
      path: '', // path to use when directory is set to custom

      // only used when directory: user|shared
      appName: undefined, // custom app name (defaults to package.json name)
      appAuthor: undefined, // custom app author (defaults to package.json author)
      appVersion: undefined, // set to false to not version (defaults to package.json major version "v#")
      folder: 'persist', // folder name inside the directory

      // will attempt to determine appName, appAuthor, appVersion from package.json
      readPackageJson: true,

      preload: true, // preloads data from disk to memory during initialization

    }, options);

    let path;

    if (options.path && options.directory !== 'custom') {
      throw new Error('You specified a path but directory is not set to custom!');
    }
    else if (options.directory === 'custom') {
      if (options.path) path = options.path;
      else throw new Error('You need to specify a path when the location is set to custom!');
    }
    else if (options.directory === 'user' || options.directory === 'shared') {
      let projectRoot;
      try {
        projectRoot = findRoot();
      } catch (error) {
        throw new Error('Failed to find the root path: ' + error.message);
      }

      let pkg;
      if (options.readPackageJson) {
        try {
          pkg = getPackageSync(projectRoot);
        } catch (error) {
          throw new Error('Failed to read package.json: ' + error.message);
        }
      }

      const appName = options.appName ?? pkg?.name;
      if (!appName || typeof appName !== 'string') throw new Error('Invalid or missing appName. Please provide a valid string value for appName when the directory is set to "user" or "shared", or enable reading the "name" from package.json using the readPackageJson:true option.');

      const appAuthor = options.appAuthor ?? (pkg?.author?.name || pkg?.author);
      if (appAuthor && typeof appAuthor !== 'string') throw new Error('Invalid appAuthor. Please provide a valid string value for appAuthor when the directory is set to "user" or "shared", or enable reading the author from package.json using the readPackageJson:true option.');

      const appVersion = options.appVersion ?? (pkg && pkg.version && `v${pkg.version.split('.')[0]}`);
      if (appVersion && typeof appVersion !== 'string') throw new Error('Invalid appVersion. Please provide a valid string value for appVersion when the directory is set to "user" or "shared", or enable reading the version from package.json using the readPackageJson:true option.');
      if (options.directory === 'user') path = userDataDir(appName, appAuthor, appVersion);
      if (options.directory === 'shared') path = siteDataDir(appName, appAuthor, appVersion);
      path = nodePath.join(path, options.folder);
    }
    else throw new Error('Invalid options.directory! The mode for selecting the storage location should be (user | shared | custom)');

    // init the PersistIt instance
    super.init({ directory: path, preload: options.preload });
  }
}