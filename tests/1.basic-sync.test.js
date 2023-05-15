const { persistIt, setDebug } = require('../dist/persist-it.cjs.js');

describe('PersistIt', () => {
  beforeAll(() => {
    setDebug(false);

    persistIt.init({
      directory: 'custom',
      path: '.data',
      appVersion: false,
    });

    // Clear the cache and write queue before each test
    persistIt.cache.clear();
    persistIt.writeQueue.clear();
    persistIt.deleteSync('test');
  });

  afterAll(() => {
    persistIt.deleteSync('test');
  });

  it('gets sync value using getSync()', () => {
    persistIt.setSync('test', { foo: 'bar' });
    const result = persistIt.getSync('test');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('deletes sync value using deleteSync()', () => {
    persistIt.setSync('test', 'hello');
    persistIt.deleteSync('test');
    const result = persistIt.getSync('test');
    expect(result).toBeUndefined();
  });

  it('gets sync value using getValueSync()', () => {
    persistIt.setSync('test', { foo: 'bar' });
    const result = persistIt.getValueSync('test', 'foo');
    expect(result).toEqual('bar');
  });

  it('sets sync value using setValueSync()', () => {
    persistIt.setSync('test', { foo: 'bar' });
    persistIt.setValueSync('test', 'baz', 'qux');
    const result = persistIt.getSync('test');
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('flushes sync data using flushSync()', () => {
    persistIt.setSync('test', 'hello');
    persistIt.flushSync();
    const result = persistIt.getSync('test');
    expect(result).toEqual('hello');
  });

});