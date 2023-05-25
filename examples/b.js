//
// Example: Storing Data in Individual Files (Keys)
//

import { persistIt } from './index';

// Initialize the storage
persistIt.init({ directory: 'user', preload: true });

async function example() {
  // Store data in a single key as an array
  await persistIt.set('users', []);

  // Add users to the array
  await persistIt.setValue('users', '', { name: 'John Doe', age: 30 });
  await persistIt.setValue('users', '', { name: 'Jane Smith', age: 25 });

  // Retrieve the array of users
  const allUsers = await persistIt.get('users');

  console.log(allUsers);
  // Output: [{ name: 'John Doe', age: 30 }, { name: 'Jane Smith', age: 25 }]

}

example();