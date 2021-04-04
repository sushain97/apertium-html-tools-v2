import * as React from 'react';

// Modeled after https://usehooks.com/useLocalStorage/.

export default <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [stateValue, setStateValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const finalValue = value instanceof Function ? value(stateValue) : value;
    setStateValue(finalValue);

    const serializedValue = JSON.stringify(finalValue);
    try {
      window.localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.log(`Failed to set LocalStorage[${key}] = ${serializedValue}: ${error}`);
    }
  };

  return [stateValue, setValue];
};
