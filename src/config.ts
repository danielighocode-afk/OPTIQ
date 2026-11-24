// Supabase settings come from build-time variables. If they are missing the app
// runs in local preview mode (accounts and scores stay on the device only).
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = key;
export const cloudEnabled = url.length > 0 && key.length > 0;

/** Where sign-in links send the student back to inside the Android app. */
export const NATIVE_REDIRECT = 'com.optiq.app://login-callback';
