// Sign-up draft: the rider fills OTP + 5 steps FIRST, the account is created only at the end.
// - text answers  -> sessionStorage (survive a page refresh, gone when the tab closes)
// - password      -> memory only (never written to storage)
// - document files-> memory only (File objects can't be stored)
const KEY = "freshrider_signup_draft_v1";
let secret = null;
let files = {};

export const draft = {
    load() {
        try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch { return {}; }
    },
    save(form) {
        try { sessionStorage.setItem(KEY, JSON.stringify(form)); } catch { /* storage full / blocked */ }
    },
    clear() {
        try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
        secret = null;
        files = {};
    },
    setPassword: (p) => { secret = p; },
    getPassword: () => secret,
    setFile(key, file) { if (file) files[key] = file; else delete files[key]; return { ...files }; },
    getFiles: () => ({ ...files }),
};