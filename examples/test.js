const { persistIt, setDebug } = require('../dist/persist-it.cjs');

setDebug(true);

persistIt.init({
    directory: 'custom',
    path: '.data',
    appVersion: false,
});

async function main() {

    var r;

    // persistIt.set('store', {
    //     foo: 'Hello',
    //     bar: 'World!'
    // });

    // r = await persistIt.get('store');

    // await persistIt.getValue('store', 'foo');

    await persistIt.setValue('store', 'foo', Date.now());
    await persistIt.setValue('store', 'baz', Date.now());
    await persistIt.setValue('store', 'a.b.x', Math.random());
    await persistIt.setValue('store', 'a.b.y', Math.random());
    await persistIt.setValue('store', 'a.c', { });
    await persistIt.setValue('store', 'a.c', [1,2,4]);
    await persistIt.setValue('store', 'bool', true);
    
    await persistIt.setValue('x y.z', 'hello', 'hi');
    await persistIt.setValue('hi👌🏻there', 'hello', 'hi');


    await persistIt.setValue('test', 'x', 1);
    console.log(1, persistIt.getValueSync('test', 'x'));
    console.log(1, await persistIt.getValue('test', 'x'));
   
    await persistIt.setValue('test', 'x', 2);
    console.log(2, persistIt.getValueSync('test', 'x'));
    console.log(2, await persistIt.getValue('test', 'x'));
   
    persistIt.setValue('test', 'x', 3);
    console.log(3, persistIt.getValueSync('test', 'x'));
    console.log(3, await persistIt.getValue('test', 'x'));
   
    await persistIt.setValue('test', 'x', 4);
    console.log(4, persistIt.getValueSync('test', 'x'));
    console.log(4, await persistIt.getValue('test', 'x'));
   
    persistIt.setValue('test', 'x', 5);
    console.log(5, persistIt.getValueSync('test', 'x'));
    console.log(5, await persistIt.getValue('test', 'x'));
   
    persistIt.setValue('test', 'x', 6);
    console.log(6, persistIt.getValueSync('test', 'x'));
    console.log(6, await persistIt.getValue('test', 'x'));

    persistIt.setValueSync('test', 'x', 7);
    console.log(7, persistIt.getValueSync('test', 'x'));
    console.log(7, await persistIt.getValue('test', 'x'));



    // r = await persistIt.get('store');
    // console.log(r);

} main();