import fs from 'fs';
import path from 'path';

import getVal from './utils/get';
import setVal from './utils/set';

const DEBUG = true;
const PREFIX = '[persist-it]';

export default class PersistItDiskStorage {
  #flushing = false;
  isInit = false;
  directory = undefined;
  cache = new Map();
  writeQueue = new Map();

  constructor(options) {
    if (options) this.init(options);
  }

  init({directory}) {
    if (DEBUG) console.log(PREFIX, 'init', directory);
    this.#flushing = false;
    this.directory = directory;
    this.cache = new Map();
    this.writeQueue = new Map();

    if (!directory) throw new Error('You need to specify a directory!');
    fs.mkdirSync(this.directory, { recursive: true });

    // preload
    this.load();
    this.isInit = true;
  }

  load() {
    if (DEBUG) console.log(PREFIX, 'loading...');
    const ls = fs.readdirSync(this.directory);
    for (const file of ls) {
      const n = path.parse(file);
      if (/^_([a-zA-Z0-9-_%]+)\.json$/.test(n.base)) {
        const key = unescapeFilename(n.base);
        this.getSync(key);
      }
    }
    if (DEBUG) console.log(PREFIX, 'loaded!');
  }

  async get(key) {
    if (DEBUG) console.log(PREFIX, 'get');
    if (this.cache.has(key)) {
      if (DEBUG) console.log(PREFIX, 'cache read');
      return this.cache.get(key);
    }
    try {
      if (DEBUG) console.log(PREFIX, 'disk read');
      const data = await fs.promises.readFile(path.join(this.directory, escapeFilename(key)), 'utf8');
      const value = deserialize(data.toString());
      this.cache.set(key, value);
      return value;
    } catch (error) {
      return undefined;
    }
  }

  async set(key, value) {
    if (DEBUG) console.log(PREFIX, 'set');
    this.cache.set(key, value);
    this.writeQueue.set(key, value);
    this.flush();
  }

  async delete(key) {
    if (DEBUG) console.log(PREFIX, 'delete');
    this.cache.delete(key);
    this.writeQueue.set(key, undefined);
    await this.flush();
  }
  
  async getValue(key, path, defaultValue) {
    if (DEBUG) console.log(PREFIX, 'getVal');
    const object = await this.get(key);
    return getVal(object, path, defaultValue);
  }
  
  async setValue(key, path, value) {
    if (DEBUG) console.log(PREFIX, 'setVal');
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
          if (DEBUG) console.log(PREFIX, 'disk erase');
          await fs.promises.unlink(path.join(this.directory, escapeFilename(key)));
        } else {
          if (DEBUG) console.log(PREFIX, 'disk write');
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
    if (DEBUG) console.log(PREFIX, 'get sync');
    if (this.cache.has(key)) {
      if (DEBUG) console.log(PREFIX, 'cache read sync');
      return this.cache.get(key);
    }
    try {
      if (DEBUG) console.log(PREFIX, 'disk read sync');
      const data = fs.readFileSync(path.join(this.directory, escapeFilename(key)), 'utf8');
      const value = deserialize(data.toString());
      this.cache.set(key, value);
      return value;
    } catch (error) {
      return null;
    }
  }

  setSync(key, value) {
    if (DEBUG) console.log(PREFIX, 'set sync');
    this.cache.set(key, value);
    this.writeQueue.set(key, value);
    this.flushSync();
  }
  
  deleteSync(key) {
    if (DEBUG) console.log(PREFIX, 'delete sync');
    this.cache.delete(key);
    this.writeQueue.set(key, null);
    this.flushSync();
  }
  
  getValueSync(key, path) {
    if (DEBUG) console.log(PREFIX, 'getVal sync');
    const object = this.getSync(key);
    return getVal(object, path, null);
  }
  
  setValueSync(key, path, value) {
    if (DEBUG) console.log(PREFIX, 'setVal sync');
    const object = this.getSync(key) || {};
    setVal(object,path, value);
    this.setSync(key, object);
  }

  flushSync() {
    for (const [key, value] of this.writeQueue) {
      if (value === null) {
        if (DEBUG) console.log(PREFIX, 'disk erase sync');
        fs.unlinkSync(path.join(this.directory, escapeFilename(key)));
      } else {
        if (DEBUG) console.log(PREFIX, 'disk write sync');
        const string = serialize(value);
        const filePath = path.join(this.directory, escapeFilename(key));
        fs.writeFileSync(filePath, string, 'utf8');
      }
    }
    this.writeQueue.clear();
  }
}

// helpers

function waitNextTick() {
  // return new Promise(r => setTimeout(r, 500));
  return new Promise(r => process.nextTick(r));
}

function escapeFilename(key) {
  const allowedChars = /[a-zA-Z0-9-_]/;
  const name =  Array.from(key, char => allowedChars.test(char) ? char : encodeURIComponent(char)).join('');
  return `_${name}.json`;
}

function unescapeFilename(filename) {
  const m = filename.match(/^_([a-zA-Z0-9-_%]+)\.json$/);
  return decodeURIComponent(m[1]);
}

function deserialize(string) {
  return JSON.parse(string);
}
function serialize(obj) {
  return JSON.stringify(obj,0,4);
}
