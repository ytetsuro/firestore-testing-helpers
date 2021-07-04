type SerializeTypeMap = {
  timestamp: {
    _seconds: number;
    _nanoseconds: number;
  };
  geopoint: {
    _latitude: number;
    _longitude: number;
  };
  documentReference: string;
};
export type SerializeType<T extends keyof SerializeTypeMap> = {
  __datatype__: T;
  value: SerializeTypeMap[T];
};
export type ImportSourceValue =
  | string
  | number
  | ImportSource
  | SerializeType<keyof SerializeTypeMap>
  | Array<
      string | number | SerializeType<keyof SerializeTypeMap> | ImportSource
    >;
export type ImportSource = {
  [key: string]: ImportSourceValue;
};
export type CollectionImportSource = {
  [documentId: string]: DocumentImportSource;
};
export type SubCollectionImportSource = {
  [subCollectionName: string]: CollectionImportSource;
};
export type DocumentImportSource = ImportSource & {
  __collections__: SubCollectionImportSource;
};

export type CollectionPath<T> = T extends string
  ? T extends `${infer T1}/${string}/${infer T2}`
    ? `${T1}/${string}/${CollectionPath<T2>}`
    : T extends `${infer T1}/${string}`
    ? `${T1}`
    : `${T}`
  : never;
export type DocumentPath<T> = T extends string
  ? T extends `${infer T1}/${string}/${infer T2}`
    ? `${T1}/${string}/${DocumentPath<T2>}`
    : T extends `${infer T1}/${string}`
    ? `${T1}/${string}`
    : `${T}/${string}`
  : never;

export type FirestoreImportSource<T> = T extends string
  ? T extends CollectionPath<T>
    ? CollectionImportSource
    : DocumentImportSource
  : never;
