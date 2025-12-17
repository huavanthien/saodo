
// This file is kept for compatibility with existing imports but no longer initializes Firebase.
// The app now uses LocalStorage.

export const app = null;
export const auth = null;
export const db = null;

// Always return true to bypass the "Firebase Not Configured" screen
export const isFirebaseConfigured = () => {
  return true;
};
