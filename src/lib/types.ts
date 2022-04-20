export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type ValueOf<T> = T[keyof T];

export type KeysOfType<From, PickType, IsStrict = false> = {
  [P in keyof From]: IsStrict extends true
    ? From[P] extends PickType
      ? PickType extends From[P]
        ? P
        : never
      : never
    : From[P] extends PickType
    ? P
    : never;
}[keyof From];

export type PickByType<From, PickType, IsStrict = false> = Pick<
  From,
  KeysOfType<From, PickType, IsStrict>
>;
