import { useState } from "react";

import { webStorage } from "~/lib/utils";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(
    () => webStorage.getItem<T>(key) ?? initialValue,
  );

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      webStorage.setItem<T>(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
