/** @format */

import { useEffect, useState } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(
    () => {
      const storage = JSON.parse(localStorage.getItem(key));

      return storage ? storage : initialState;
    }
    //this value has to be pure, cannot receive arguments
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
}
