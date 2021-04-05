import * as React from 'react';

// Modeled after https://usehooks.com/useLocalStorage/.

const storeValue = <T>(key: string, value: T) => {
  const serializedValue = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.warn(`Failed to set LocalStorage[${key}] = ${serializedValue}: ${error}`);
  }
};

export default <T>(
  key: string,
  initialValue: T | (() => T),
  overrideValue?: T | null,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [stateValue, setStateValue] = React.useState<T>(() => {
    if (overrideValue) {
      storeValue(key, overrideValue);
      return overrideValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Failed to parse LocalStorage[${key}]: ${error}`);
    }

    const value = initialValue instanceof Function ? initialValue() : initialValue;
    storeValue(key, value);
    return value;
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const finalValue = value instanceof Function ? value(stateValue) : value;
    setStateValue(finalValue);
    storeValue(key, finalValue);
  };

  return [stateValue, setValue];
};
