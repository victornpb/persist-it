//
// Example: Storing Data in Individual Files (Keys)
//

import { persistIt } from './index';

// Initialize the storage
persistIt.init({ directory: 'user', preload: true });

async function example() {
  // Store big objects as individual files/keys
  await persistIt.set('object1', { /* large object 1 */ });
  await persistIt.set('object2', { /* large object 2 */ });

  // Retrieve big objects from individual files/keys
  const object1 = await persistIt.get('object1');
  const object2 = await persistIt.get('object2');

  // Perform operations on the big objects as needed

  // Flush changes to persistent storage
  await persistIt.flush();
}

example();