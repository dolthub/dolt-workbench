import { safeStorage } from "electron";
import Store from "electron-store";

const store = new Store<{ encryptedApiKey?: string }>({ name: "agent-config" });

const API_KEY_STORE_KEY = "encryptedApiKey";

export function storeApiKey(apiKey: string): boolean {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn("Encryption not available, storing API key in plain text");
      store.set(API_KEY_STORE_KEY, apiKey);
      return true;
    }

    const encrypted = safeStorage.encryptString(apiKey);
    store.set(API_KEY_STORE_KEY, encrypted.toString("base64"));
    return true;
  } catch (error) {
    console.error("Failed to store API key:", error);
    return false;
  }
}

export function getStoredApiKey(): string | null {
  try {
    const stored = store.get(API_KEY_STORE_KEY);
    if (!stored) {
      return null;
    }

    if (!safeStorage.isEncryptionAvailable()) {
      return stored;
    }

    const encrypted = Buffer.from(stored, "base64");
    return safeStorage.decryptString(encrypted);
  } catch (error) {
    console.error("Failed to retrieve API key:", error);
    return null;
  }
}

export function clearStoredApiKey(): void {
  store.delete(API_KEY_STORE_KEY);
}
