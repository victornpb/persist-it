// General storage
import PersistIt from './persist-it';
export { PersistIt };

// Storage for app
import PersistItApp from './persist-it-app';
export { PersistItApp };

// Singleton instance
export const persistIt = new PersistItApp();
