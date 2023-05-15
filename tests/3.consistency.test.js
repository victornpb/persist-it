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

  it('gets sync and async values consistently after await setValue', async () => {
    await persistIt.set('test', {});
    await persistIt.setValue('test', 'x', 1);
    expect(await persistIt.getValue('test', 'x')).toEqual(1);
    expect(persistIt.getValueSync('test', 'x')).toEqual(1);
  });

  it('gets sync and async values consistently after await setValue (second case)', async () => {
    await persistIt.setValue('test', 'x', 2);
    expect(await persistIt.getValue('test', 'x')).toEqual(2);
    expect(persistIt.getValueSync('test', 'x')).toEqual(2);
  });

  it('gets sync and async values consistently after setValue async without awaiting', async () => {
    persistIt.setValue('test', 'x', 3);
    // expect(persistIt.getValueSync('test', 'x')).toEqual(3);
    expect(await persistIt.getValue('test', 'x')).toEqual(3);
  });

  it('gets sync and async values consistently after await setValue (third case)', async () => {
    await persistIt.setValue('test', 'x', 4);
    expect(persistIt.getValueSync('test', 'x')).toEqual(4);
    expect(await persistIt.getValue('test', 'x')).toEqual(4);
  });

  it('gets sync and async values consistently after setValue async without awaiting (second case)', async () => {
    persistIt.setValue('test', 'x', 5);
    // expect(persistIt.getValueSync('test', 'x')).toEqual(5);
    expect(await persistIt.getValue('test', 'x')).toEqual(5);
  });

  it('sets values synchronously and checks consistency', async () => {
    persistIt.setValueSync('test', 'x', 7);
    expect(persistIt.getValueSync('test', 'x')).toEqual(7);
    expect(await persistIt.getValue('test', 'x')).toEqual(7);
  });

  it('sets multiple values synchronously and checks consistency', async () => {
    persistIt.setValueSync('test', 'x', 1);
    persistIt.setValueSync('test', 'x', 2);
    persistIt.setValueSync('test', 'x', 3);
    expect(persistIt.getValueSync('test', 'x')).toEqual(3);
    expect(await persistIt.getValue('test', 'x')).toEqual(3);
  });

});