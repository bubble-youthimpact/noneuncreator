/*
  Firebase settings for Noneun Creator accounts (login, sign up, saved progress).

  Where to find these values:
  Firebase console → Project settings (gear icon) → General → "Your apps" → Web app → "SDK setup and configuration" → Config.
  Copy each value between the quotes below.

  While apiKey is empty, accounts stay switched off and the site shows "Accounts are coming soon".
  These values are safe to publish: access is controlled by firestore.rules and the Authorized domains list in Firebase.
*/
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
