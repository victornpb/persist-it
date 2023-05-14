import * as nodePath from 'path';
import { getPackageSync } from './utils/getPkg';
import { AppDirs } from './utils/dirs';
import findRoot  from './utils/findRoot';
import PersistIt from './persist-it';
import defaults from 'default-args';

export default class PersistItApp extends PersistIt {
    init(options) {

        options = defaults({
            directory: 'user', // Specifies the mode for selecting the storage location (user | shared | custom)
            path: '', // path to use when directory is set to custom
            
            // only used when directory: user|shared
            appName: undefined,
            appAuthor: undefined,
            appVersion: undefined,
            folder: 'persist',

            // will attempt to determine appName, appAuthor, appVersion from package.json
            readPackageJson: true,

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
            if (appAuthor && typeof appAuthor !== 'string')  throw new Error('Invalid appAuthor. Please provide a valid string value for appAuthor when the directory is set to "user" or "shared", or enable reading the author from package.json using the readPackageJson:true option.');
            
            const appVersion = options.appVersion ?? (pkg && pkg.version && `v${pkg.version.split('.')[0]}`);
            if (appVersion && typeof appVersion !== 'string') throw new Error('Invalid appVersion. Please provide a valid string value for appVersion when the directory is set to "user" or "shared", or enable reading the version from package.json using the readPackageJson:true option.');            

            const dirs = new AppDirs(appName, appAuthor, appVersion);
            if (options.directory === 'user') path = dirs.userDataDir();
            if (options.directory === 'shared') path = dirs.siteDataDir();
            path = nodePath.join(path, options.folder);
        }

        // init the PersistIt instance
        super.init({directory: path});
    }
}