const Parse = window.Parse;

// Use environment variables for security
Parse.initialize(
  "H7mNcSLIAugkFnd2Hsgdu2Cfw12hJ2xv7VDoB9Ke", // App ID
  "EwkkaOVVrsb8whVlZ7GU1MF3E2bVQFXxHQQzIJ9Q" // JavaScript/Client Key
);

// Point to the Back4App API URL
Parse.serverURL = 'https://parseapi.back4app.com/';

export default Parse;
