/**
 * Must yield or await
 * @param ms
 * @returns A promise
 */
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 *
 * @param tuple [key, value, condition?], [key, value, condition?]...
 * @returns
 */
export const createConditionalObject = (
  ...tuple: [string | number | symbol, any, boolean?][]
) => {
  const obj: any = {};

  for (let i = 0; i < tuple.length; i++) {
    if (tuple[i][2] === undefined || tuple[i][2])
      obj[tuple[i][0]] = tuple[i][1];
  }

  return obj;
};

/**
 * Alias for createConditionalObject
 * @param tuple [key, value, condition?], [key, value, condition?]...
 * @returns
 */
export const cco = createConditionalObject;
