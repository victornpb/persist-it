/**
 * Platform specific directory locator. (Implementation based on appdirs module)
 * @module appdirs
 */

import os from 'os';
import path from 'path';

/**
 * Append the name and and version to a path.
 * Both the appname and version are optional. The version is only appended if the appname.
 * @param {string} dir Base directory.
 * @param {string} [appname] Optional name to append.
 * @param {string} [version] Optional version to append.
 * @returns Resulting path
 * @private
 */
function appendNameVersion(dir, appname, version) {
  if (appname) {
    dir = path.join(dir, appname);
    if (version) {
      dir = path.join(dir, version);
    }
  }
  return dir;
}

/**
 * Windows appdirs implementation.
 *
 * The standard directory structure for Windows can be found on
 * [MSDN]{@link http://support.microsoft.com/default.aspx?scid=kb;en-us;310294#XSLTH3194121123120121120120}.
 */
export const windows = {
  userDataDir(appname, appauthor, version, roaming) {
    const dir = roaming ? process.env.APPDATA : process.env.LOCALAPPDATA;
    return appendNameVersion(dir, appname, version);
  },
  userConfigDir(appname, appauthor, version, roaming) {
    const dir = roaming ? process.env.APPDATA : process.env.LOCALAPPDATA;
    return appendNameVersion(dir, appname, version);
  },
  userCacheDir(appname, appauthor, version) {
    return appendNameVersion(process.env.LOCALAPPDATA, appname, version);
  },
  siteDataDir(appname, appauthor, version, multipath) {
    const dir = appendNameVersion(process.env.ALLUSERSPROFILE, appname, version);
    if (multipath) {
      return [dir];
    }
    return dir;
  },
  siteConfigDir(appname, appauthor, version, multipath) {
    const dir = appendNameVersion(process.env.ALLUSERSPROFILE, appname, version);
    if (multipath) {
      return [dir];
    }
    return dir;
  },
  userLogDir(appname, appauthor, version) {
    return appendNameVersion(process.env.ALLUSERSPROFILE, appname, version);
  }
};

/**
 * OS X appdirs implementation.
 *
 * The standard directory structure for OS X can be found on
 * @link https://developer.apple.com/library/mac/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html
 */
export const darwin = {
  userDataDir(appname, appauthor, version, roaming) {
    const dir = path.join(process.env.HOME, 'Library/Application Support');
    return appendNameVersion(dir, appname, version);
  },
  userConfigDir(appname, appauthor, version, roaming) {
    return exports.darwin.userDataDir(appname, appauthor, version, roaming);
  },
  userCacheDir(appname, appauthor, version) {
    const dir = path.join(process.env.HOME, 'Library/Caches');
    return appendNameVersion(dir, appname, version);
  },
  siteDataDir(appname, appauthor, version, multipath) {
    const dir = appendNameVersion('/Library/Application Support', appname, version);
    if (multipath) {
      return [dir];
    }
    return dir;
  },
  siteConfigDir(appname, appauthor, version, multipath) {
    return exports.darwin.siteDataDir(appname, appauthor, version, multipath);
  },
  userLogDir(appname, appauthor, version) {
    const dir = path.join(process.env.HOME, 'Library/Logs');
    return appendNameVersion(dir, appname, version);
  }
};

/**
 * XDG appdirs implementation.
 *
 * The is the standard directory structure appdirs uses for *NIX operating
 * systems. The XDG spec can be found on
 * @link http://standards.freedesktop.org/basedir-spec/basedir-spec-latest.html
 */
export const xdg = {
  userDataDir(appname, appauthor, version, roaming) {
    const dir = process.env.XDG_DATA_HOME || path.join(process.env.HOME, '.local/share');
    return appendNameVersion(dir, appname, version);
  },
  userConfigDir(appname, appauthor, version, roaming) {
    const dir = process.env.XDG_CONFIG_HOME || path.join(process.env.HOME, '.config');
    return appendNameVersion(dir, appname, version);
  },
  userCacheDir(appname, appauthor, version) {
    const dir = process.env.XDG_CACHE_HOME || path.join(process.env.HOME, '.cache');
    return appendNameVersion(dir, appname, version);
  },
  siteDataDir(appname, appauthor, version, multipath) {
    const dirstr = process.env.XDG_DATA_DIRS || ['/usr/local/share', '/usr/share'].join(path.delimiter);

    const dirs = dirstr.split(path.delimiter).map(dir => {
      return appendNameVersion(dir, appname, version);
    });

    if (multipath) {
      return dirs;
    } else {
      return dirs[0];
    }
  },
  siteConfigDir(appname, appauthor, version, multipath) {
    const dirstr = process.env.XDG_CONFIG_DIRS || '/etc/xdg';

    const dirs = dirstr.split(path.delimiter).map(dir => {
      return appendNameVersion(dir, appname, version);
    });

    if (multipath) {
      return dirs;
    } else {
      return dirs[0];
    }
  },
  userLogDir(appname, appauthor, version) {
    const cacheDir = exports.xdg.userCacheDir(appname, appauthor, version);
    return path.join(cacheDir, 'log');
  }
};

const platform = os.platform();
const impl = (platform === 'win32' ? windows : platform === 'darwin' ? darwin : xdg);

/**
 * Retrieves the user-specific data directory path.
 * @param {string} appname - Optional name to append.
 * @param {string} appauthor - Optional author name to append. (required on windows)
 * @param {string} version - Optional version to append. (Only used if appname is set)
 * @param {boolean} roaming - Indicates whether the directory should be roaming or local (Windows only).
 * @returns {string} - The user-specific data directory path.
 */
export const userDataDir = impl.userDataDir;

/**
 * Retrieves the user-specific configuration directory path.
 * @param {string} appname - Optional name to append.
 * @param {string} appauthor - Optional author name to append. (required on windows)
 * @param {string} version - Optional version to append. (Only used if appname is set)
 * @param {boolean} roaming - Indicates whether the directory should be roaming or local (Windows only).
 * @returns {string} - The user-specific configuration directory path.
 */
export const userConfigDir = impl.userConfigDir;

/**
 * Retrieves the site-specific data directory path.
 * @param {string} appname - Optional name to append.
 * @param {string} appauthor - Optional author name to append. (required on windows)
 * @param {string} version - Optional version to append. (Only used if appname is set)
 * @param {boolean} multipath - Indicates whether to return multiple paths (array) or a single path.
 * @returns {string|string[]} - The site-specific data directory path(s).
 */
export const siteDataDir = impl.siteDataDir;

/**
 * Retrieves the site-specific configuration directory path.
 * @param {string} appname - Optional name to append.
 * @param {string} appauthor - Optional author name to append. (required on windows)
 * @param {string} version - Optional version to append. (Only used if appname is set)
 * @param {boolean} multipath - Indicates whether to return multiple paths (array) or a single path.
 * @returns {string|string[]} - The site-specific configuration directory path(s).
 */
export const siteConfigDir = impl.siteConfigDir;

/**
 * Retrieves the user-specific log directory path.
 * @param {string} appname - Optional name to append.
 * @param {string} appauthor - Optional author name to append. (required on windows)
 * @param {string} version - Optional version to append. (Only used if appname is set)
 * @returns {string} - The user-specific log directory path.
 */
export const userLogDir = impl.userLogDir;
