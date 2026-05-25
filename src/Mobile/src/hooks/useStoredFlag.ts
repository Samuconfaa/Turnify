import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export function useStoredFlag(key: string, defaultValue = false): [boolean | null, (v: boolean) => Promise<void>] {
  const [value, setValue] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(key).then(raw => {
      setValue(raw === null ? defaultValue : raw === 'true');
    });
  }, [key]);

  const set = async (v: boolean) => {
    await SecureStore.setItemAsync(key, String(v));
    setValue(v);
  };

  return [value, set];
}

export async function getStoredFlag(key: string, defaultValue = false): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(key);
  return raw === null ? defaultValue : raw === 'true';
}

export async function setStoredFlag(key: string, value: boolean): Promise<void> {
  await SecureStore.setItemAsync(key, String(value));
}
