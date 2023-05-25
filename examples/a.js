//
// Example: Storing Data in Individual Files (Keys)
//

import { persistIt } from './index';

// Initialize the storage
persistIt.init({ directory: 'user', preload: true });

async function example() {
  // Store data in individual files
  await persistIt.set('user1', { name: 'John Doe', age: 30 });
  await persistIt.set('user2', { name: 'Jane Smith', age: 25 });

  // Retrieve data from individual files
  const user1 = await persistIt.get('user1');
  const user2 = await persistIt.get('user2');

  console.log(user1); // Output: { name: 'John Doe', age: 30 }
  console.log(user2); // Output: { name: 'Jane Smith', age: 25 }
}

example();