import fs from 'fs';
import path from 'path';

import getVal from './utils/get';
import setVal from './utils/set';

import { DEBUG, PREFIX } from './utils/flags';

export default class PersistItDiskStorage {
  #flushing = false;
  isInit = false;
  directory = undefined;
  cache = new Map();
  writeQueue = new Map();

  constructor(options) {
    if (options) this.init(options);
  }

  init({ directory, preload }) {
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

  async set(key, value) {
    if (DEBUG) console.log(PREFIX, 'set', key, value);
    this.cache.set(key, value);
    this.writeQueue.set(key, value);
    this.flush();
  }

  async delete(key) {
    if (DEBUG) console.log(PREFIX, 'delete', key);
    this.cache.set(key, undefined); // do not delete key from cache or a get() on the same tick cache miss and read the to-be-deleted file from disk
    this.writeQueue.set(key, undefined);
    await this.flush();
  }

  async getValue(key, path, defaultValue) {
    if (DEBUG) console.log(PREFIX, 'getVal', key, path, defaultValue);
    const object = await this.get(key);
    return getVal(object, path, defaultValue);
  }

  async setValue(key, path, value) {
    if (DEBUG) console.log(PREFIX, 'setVal', key, path, value);
    const object = await this.get(key) || {};
    setVal(object, path, value);
    await this.set(key, object);
  }

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

  setSync(key, value) {
    if (DEBUG) console.log(PREFIX, 'set sync', key, value);
    this.cache.set(key, value);
    this.writeQueue.set(key, value);
    this.flushSync();
  }

  deleteSync(key) {
    if (DEBUG) console.log(PREFIX, 'delete sync', key);
    this.cache.set(key, undefined);
    this.writeQueue.set(key, undefined);
    this.flushSync();
  }

  getValueSync(key, path) {
    if (DEBUG) console.log(PREFIX, 'getVal sync', key, path);
    const object = this.getSync(key);
    return getVal(object, path, undefined);
  }

  setValueSync(key, path, value) {
    if (DEBUG) console.log(PREFIX, 'setVal sync', key, path, value);
    const object = this.getSync(key) || {};
    setVal(object, path, value);
    this.setSync(key, object);
  }

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

const FILENAME_PATTERN = /^_([a-zA-Z0-9\-_%. ]+)\.json$/;

function escapeFilename(key) {
  const name = encodeURIComponent(key)
    .replace(/([^a-zA-Z0-9\-%_ ])/g,
      (match) => '%' + match.charCodeAt(0).toString(16).toUpperCase());
  return `_${name}.json`;
}
function unescapeFilename(filename) {
  const m = filename.match(FILENAME_PATTERN);
  return decodeURIComponent(m[1]);
}

function deserialize(string) {
  return JSON.parse(string);
}
function serialize(obj) {
  return JSON.stringify(obj, null, DEBUG ? '\t' : 0);
}

function waitNextTick() {
  // return new Promise(r => setTimeout(r, 500));
  return new Promise(r => process.nextTick(r));
}
