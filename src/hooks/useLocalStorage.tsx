import { useStorageState } from "react-storage-hooks";

type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? undefined
  : ((...b: T) => void) extends (a: any, ...b: infer I) => void
  ? I
  : [];

const useLocalStorage = (
  ...args: RemoveFirstFromTuple<Parameters<typeof useStorageState>>
) => useStorageState<typeof args[0]>(localStorage, ...args);

export default useLocalStorage;
