export const STORAGE_VERSION = "fsh-v5";

export const storage = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      return null;
    }
    return null;
  },

  async set(key, value) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // localStorage may be unavailable in private or restricted contexts.
    }
  },
};
