/**
 * Example: User Preferences Storage
 * 
 * This example demonstrates how to use the "persist-it" library to store and retrieve user preferences.
 * The user preferences object is stored in a single key ('userPreferences') and can be accessed using the `get` method.
 * Individual properties could be accessed directly with getValue and modified with setValue
 */

import { persistIt } from 'persist-it';

// Initialize the singleton instance
persistIt.init(/* options */);

async function main() {

  // Set and retrieve user preferences
  persistIt.set('userPreferences', { darkMode: true, fontSize: 16 });

  const userPreferences = await persistIt.get('userPreferences');
  console.log(userPreferences); // { darkMode: true, fontSize: 16 }

  const darkMode = await persistIt.getValue('userPreferences', 'darkMode');
  console.log(darkMode); // true
}

main();
