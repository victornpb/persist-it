const { persistIt, setDebug } = require('../dist/persist-it.cjs.js');

describe('PersistIt', () => {
  beforeAll(() => {

    setDebug(true);

    persistIt.init({
      directory: 'custom',
      path: '.data',
      appVersion: false,
    });

    // Clear the cache and write queue before each test
    persistIt.cache.clear();
    persistIt.writeQueue.clear();
  });

  afterAll(() => {
    // persistIt.deleteSync('test');
  });

  it('sets and gets data correctly using set() and get()', async () => {
    await persistIt.set('test', 'hello');
    const result = await persistIt.get('test');
    expect(result).toEqual('hello');
  });

  it('deletes data correctly using delete()', async () => {
    await persistIt.set('test', {x:1, y:2});
    await persistIt.delete('test');
    const result = await persistIt.get('test');
    expect(result).toBeUndefined();
  });

  it('gets value using getValue()', async () => {
    await persistIt.set('test', { foo: 'bar' });
    const result = await persistIt.getValue('test', 'foo');
    expect(result).toEqual('bar');
  });

  it('sets value using setValue()', async () => {
    await persistIt.set('test', { foo: 'bar' });
    await persistIt.setValue('test', 'baz', 'qux');
    const result = await persistIt.get('test');
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('flushes data using flush()', async () => {
    await persistIt.set('test', 'hello');
    await persistIt.flush();
    const result = await persistIt.get('test');
    expect(result).toEqual('hello');
  });

});