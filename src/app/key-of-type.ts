export type KeyOfType<TObject, TValue> = {
  [K in keyof TObject]-?: TObject[K] extends TValue ? K : never;
}[keyof TObject];
