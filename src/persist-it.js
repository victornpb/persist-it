import fs from 'fs';
import path from 'path';

import { DEBUG, PREFIX } from './utils/flags';

import getDeepVal from './utils/get';
import setDeepVal from './utils/set';


/**
 * Options for initializing the PersistIt instance.
 * @typedef {Object} PersistItOptions
 * @property {string} [directory='user'] - The directory path to read and write files from disk.
 * @property {boolean} [preload=true] - Preloads data from disk to memory during initialization.
 */

export default class PersistItDiskStorage {
  /** @type {boolean} Indicates whether a flushing operation is scheduled to occur on the next tick of the event loop */
  #flushing = false;
  /** @type {boolean} Indicates if the instance has been initialized. */
  isInit = false;
  /** @type {string} The directory path read and writes to disk will happen */
  directory = undefined;
  /** Cache for storing key-value pairs in memory. */
  cache = new Map();
  /** Queue for async write operations. */
  writeQueue = new Map();

  /**
   * Creates a new instance of PersistItDiskStorage.
   * @param {PersistItOptions} options - The options for initializing the storage.
   */
  constructor(options) {
    if (options) this.init(options);
  }

  /**
   * Initializes the disk storage.
   * @param {PersistItOptions} options - The options for initializing the storage..
   * @throws {Error} If no directory is specified.
   */
  init({ directory, preload = true }) {
    if (DEBUG) console.log(PREFIX, 'init', directory);
    this.#flushing = false;
    this.directory = directory;
    this.cache = new Map();
    this.writeQueue = new Map();

    if (!directory) throw new Error('You need to specify a directory!');
    fs.mkdirSync(this.directory, { recursive: true });

    // preload
    if (preload) this.load();

    this.isInit = true;
  }

  /**
   * Loads data from existing files in the storage directory.
   */
  load() {
    if (DEBUG) console.log(PREFIX, 'loading...');
    const ls = fs.readdirSync(this.directory);
    for (const file of ls) {
      const n = path.parse(file);
      if (FILENAME_PATTERN.test(n.base)) {
        const key = unescapeFilename(n.base);
        this.getSync(key);
      }
    }
    if (DEBUG) console.log(PREFIX, 'loaded!');
  }

  /**
   * Retrieves the value associated with the given key asynchronously.
   * @param {string} key - The key to retrieve the value for.
   * @returns The value, or undefined if not found.
   */
  async get(key) {
    if (DEBUG) console.log(PREFIX, 'get', key);
    if (this.cache.has(key)) {
      if (DEBUG) console.log(PREFIX, 'cache read', key);
      return this.cache.get(key);
    }
    try {
      if (DEBUG) console.log(PREFIX, 'DISK READ');
      const data = await fs.promises.readFile(path.join(this.directory, escapeFilename(key)), 'utf8');
      const value = deserialize(data.toString());
      this.cache.set(key, value);
      return value;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Sets the value associated with the given key asynchronously.
   * @param {string} key - The key to set the value for.
   * @param {any} value - The value to set.
   * @returns A Promise that resolves when the value has been set.
   */
  async set(key, value) {
    if (DEBUG) console.log(PREFIX, 'set', key, value);
    this.cache.set(key, value);
    this.writeQueue.set(key, value);
    this.flush();
  }

  /**
   * Deletes the value associated with the given key asynchronously.
   * @param {string} key - The key to delete.
   * @returns A Promise that resolves when the value has been deleted.
   */
  async delete(key) {
    if (DEBUG) console.log(PREFIX, 'delete', key);
    this.cache.set(key, undefined); // do not delete key from cache or a get() on the same tick cache miss and read the to-be-deleted file from disk
    this.writeQueue.set(key, undefined);
    await this.flush();
  }

  /**
   * Retrieves the value at the specified path within the object associated with the given key asynchronously.
   * @param {string} key - The key to retrieve the value for.
   * @param {string} path - The path to the desired value within the object.
   * @param {any} [defaultValue=undefined] - The default value to return if the path does not exist.
   * @returns {Promise<any>} A Promise that resolves to the value at the specified path, or the defaultValue if not found.
   * @example
   * // Given an object { foo: { bar: { baz: 42 } } }
   * const value = await persistIt.getValue('myKey', 'foo.bar.baz'); // Returns 42
   * const defaultValue = await persistIt.getValue('myKey', 'nonExistentPath', 'default'); // Returns 'default'
   */
  async getValue(key, path, defaultValue) {
    if (DEBUG) console.log(PREFIX, 'getVal', key, path, defaultValue);
    const object = await this.get(key);
    const value = getDeepVal(object, path, defaultValue);
    return value;
  }

  /**
   * Sets the value at the specified path within the object associated with the given key asynchronously.
   * @param {string} key - The key to set the value for.
   * @param {string} path - The path to the desired location within the object.
   * @param {any} value - The value to set.
   * @returns {Promise<void>} A Promise that resolves when the value has been set.
   * @example
   * // Given an object { foo: { bar: {} } }
   * await persistIt.setValue('myKey', 'foo.bar.baz', 42); // Sets the value at 'foo.bar.baz' to 42
   * await persistIt.setValue('myKey', 'foo.bar', { baz: 42 }); // Sets the value at 'foo.bar' to { baz: 42 }
   */
  async setValue(key, path, value) {
    if (DEBUG) console.log(PREFIX, 'setVal', key, path, value);
    const object = await this.get(key) || {};
    setDeepVal(object, path, value);
    await this.set(key, object);
  }

  /**
   * Flushes pending write operations to disk asynchronously.
   * @returns A Promise that resolves when the write operations have been flushed.
   */
  async flush() {
    if (!this.#flushing) {
      this.#flushing = true;
      await waitNextTick();
      for (const [key, value] of this.writeQueue) {
        if (value === undefined) {
          if (DEBUG) console.log(PREFIX, 'DISK ERASE', key);
          try {
            await fs.promises.unlink(path.join(this.directory, escapeFilename(key)));
          } catch (err) { if (err.code !== 'ENOENT') throw err; }
        } else {
          if (DEBUG) console.log(PREFIX, 'DISK WRITE', key);
          const string = serialize(value);
          const filePath = path.join(this.directory, escapeFilename(key));
          await fs.promises.writeFile(filePath, string, 'utf8');
        }
      }
      this.writeQueue.clear();
      this.#flushing = false;
    }
  }

  // Sync methods

  /**
   * Retrieves the value associated with the given key synchronously.
   * @param {string} key - The key to retrieve the value for.
   * @returns {any} The value associated with the key, or undefined if not found.
   */
  getSync(key) {
    if (DEBUG) console.log(PREFIX, 'get sync', key);
    if (this.cache.has(key)) {
      if (DEBUG) console.log(PREFIX, 'cache read sync');
      return this.cache.get(key);
    }
    try {
      if (DEBUG) console.log(PREFIX, 'DISK READ sync', key);
      const data = fs.readFileSync(path.join(this.directory, escapeFilename(key)), 'utf8');
      const value = deserialize(data.toString());
      this.cache.set(key, value);
      return value;
    } catch (error) {
      return undefined;
    }
  }
  /**
    * Sets the value associated with the given key synchronously.
    * @param {string} key - The key to set the value for.
    * @param {any} value - The value to set.
    */
  setSync(key, value) {
    if (DEBUG) console.log(PREFIX, 'set sync', key, value);
    this.cache.set(key, value);
    this.writeQueue.set(key, value);
    this.flushSync();
  }

  /**
   * Deletes the value associated with the given key synchronously.
   * @param {string} key - The key to delete.
   */
  deleteSync(key) {
    if (DEBUG) console.log(PREFIX, 'delete sync', key);
    this.cache.set(key, undefined);
    this.writeQueue.set(key, undefined);
    this.flushSync();
  }
  /**
   * Retrieves the value at the specified path within the object associated with the given key synchronously.
   * @param {string} key - The key to retrieve the value for.
   * @param {string} path - The path to the desired value within the object.
   * @param {any} [defaultValue=undefined] - The default value to return if the path does not exist.
   * @returns {any} The value at the specified path, or undefined if not found.
   * @example
   * // Given an object { foo: { bar: { baz: 42 } } }
   * const value = persistIt.getValueSync('myKey', 'foo.bar.baz'); // Returns 42
   */
  getValueSync(key, path, defaultValue) {
    if (DEBUG) console.log(PREFIX, 'getVal sync', key, path);
    const object = this.getSync(key);
    return getDeepVal(object, path, defaultValue);
  }
  /**
   * Sets the value at the specified path within the object associated with the given key synchronously.
   * @param {string} key - The key to set the value for.
   * @param {string} path - The path to the desired location within the object.
   * @param {any} value - The value to set.
   * @example
   * // Given an object { foo: { bar: {} } }
   * persistIt.setValueSync('myKey', 'foo.bar.baz', 42); // Sets the value at 'foo.bar.baz' to 42
   */
  setValueSync(key, path, value) {
    if (DEBUG) console.log(PREFIX, 'setVal sync', key, path, value);
    const object = this.getSync(key) || {};
    setDeepVal(object, path, value);
    this.setSync(key, object);
  }

  /**
   * Flushes pending write operations to disk synchronously.
   */
  flushSync() {
    for (const [key, value] of this.writeQueue) {
      if (value === undefined) {
        if (DEBUG) console.log(PREFIX, 'DISK ERASE sync', key);
        try {
          fs.unlinkSync(path.join(this.directory, escapeFilename(key)));
        } catch (err) { if (err.code !== 'ENOENT') throw err; }
      } else {
        if (DEBUG) console.log(PREFIX, 'DISK WRITE sync',);
        const string = serialize(value);
        const filePath = path.join(this.directory, escapeFilename(key));
        fs.writeFileSync(filePath, string, 'utf8');
      }
    }
    this.writeQueue.clear();
  }
}

/******************************* helpers *******************************/

/** @private */
const FILENAME_PATTERN = /^_([a-zA-Z0-9\-_%. ]+)\.json$/;

/**
 * Escapes a key to be used as a filename.
 * @param {string} key - The key to escape.
 * @returns {string} The escaped filename.
 */
function escapeFilename(key) {
  const name = encodeURIComponent(key)
    .replace(/([^a-zA-Z0-9\-%_ ])/g, (match) => '%' + match.charCodeAt(0).toString(16).toUpperCase());
  return `_${name}.json`;
}

/**
 * Unescapes a filename to retrieve the original key.
 * @param {string} filename - The filename to unescape.
 * @returns {string} The unescaped key.
 */
function unescapeFilename(filename) {
  const m = filename.match(FILENAME_PATTERN);
  return decodeURIComponent(m[1]);
}

/**
 * Deserializes a string into an object.
 * @param {string} string - The serialized string.
 * @returns {any} The deserialized object.
 */
function deserialize(string) {
  return JSON.parse(string);
}

/**
 * Serializes an object into a string.
 * @param {any} obj - The object to serialize.
 * @returns {string} The serialized string.
 */
function serialize(obj) {
  return JSON.stringify(obj, null, DEBUG ? '\t' : 0);
}

/**
 * Waits for the next tick of the event loop.
 * @returns {Promise<void>} A Promise that resolves on the next tick.
 */
function waitNextTick() {
  return new Promise((resolve) => process.nextTick(resolve));
}