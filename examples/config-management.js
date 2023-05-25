/**
 * Example: Configuration Management
 * 
 * This example demonstrates how to use the "persist-it" library to manage application configurations.
 * The configurations are stored in a single key ('config') as an object and can be accessed using the `get` and `set` methods.
 */

import { persistIt } from 'persist-it';

// Initialize the singleton instance
persistIt.init({ directory: 'app', preload: true });

async function main() {

  // Get the current application configuration
  const config = await persistIt.get('config') || {};

  // Modify specific configuration values
  config.theme = 'dark';
  config.notifications = true;

  // Update the configuration
  await persistIt.set('config', config);

  console.log('Updated Configuration:', config);
}

main();
