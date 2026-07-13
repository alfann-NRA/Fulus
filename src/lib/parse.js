import Parse from 'parse';

// Use environment variables for security
Parse.initialize(
  import.meta.env.VITE_APP_ID, // App ID
  import.meta.env.VITE_CLIENT_KEY // JavaScript/Client Key
);

// Point to the Back4App API URL
Parse.serverURL = 'https://parseapi.back4app.com/';

export default Parse;
