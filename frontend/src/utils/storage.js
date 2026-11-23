import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memStore = new Map();

const isWeb = Platform.OS === 'web';

export const storage = {
  get: async (key) => {
    try {
      if (isWeb) return typeof window !== 'undefined' ? window.localStorage?.getItem(key) : memStore.get(key) ?? null;
      return await SecureStore.getItemAsync(key);
    } catch {
      return memStore.get(key) ?? null;
    }
  },
  set: async (key, value) => {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined') window.localStorage?.setItem(key, value);
        else memStore.set(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      memStore.set(key, value);
    }
  },
  remove: async (key) => {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined') window.localStorage?.removeItem(key);
        else memStore.delete(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      memStore.delete(key);
    }
  },
};
