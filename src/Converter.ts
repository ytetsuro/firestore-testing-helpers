import { firestore } from "firebase-admin";
import {
  ImportSource,
  ImportSourceValue,
  SerializeType,
} from "./FirestoreDataSource";

type ImportableValue =
  | number
  | string
  | firestore.Timestamp
  | firestore.GeoPoint
  | firestore.DocumentReference
  | { [key: string]: ImportableValue }
  | ImportableValue[];

export class Converter
  implements firestore.FirestoreDataConverter<ImportSource>
{
  constructor(private readonly connection: firestore.Firestore) {}

  toFirestore(modelObject: ImportSource): firestore.DocumentData {
    return Object.entries(modelObject)
      .filter(([keyName]) => keyName !== "__collections__")
      .reduce(
        (values, [key, value]) => ({
          ...values,
          [key]: this.toFirestoreSavableType(value),
        }),
        {}
      );
  }

  fromFirestore(snapshot: firestore.QueryDocumentSnapshot) {
    return Object.entries(snapshot.data()).reduce(
      (values, [key, value]) => ({
        ...values,
        [key]: this.fromFirestoreSavableType(value),
      }),
      {}
    );
  }

  private toFirestoreSavableType(value: ImportSourceValue): ImportableValue {
    if (Array.isArray(value)) {
      return value.map((childValue) => this.toFirestoreSavableType(childValue));
    } else if (Object.prototype.toString.call(value) !== "[object Object]") {
      return <string | number>value;
    } else if (!(<ImportSource>value)["__datatype__"]) {
      return Object.entries(value).reduce(
        (result, [key, value]) => ({
          ...result,
          [key]: this.toFirestoreSavableType(value),
        }),
        {}
      );
    }

    if ((<ImportSource>value)["__datatype__"] === "geopoint") {
      return new firestore.GeoPoint(
        (<SerializeType<"geopoint">>value).value._latitude,
        (<SerializeType<"geopoint">>value).value._longitude
      );
    } else if ((<ImportSource>value)["__datatype__"] === "timestamp") {
      return new firestore.Timestamp(
        (<SerializeType<"timestamp">>value).value._seconds,
        (<SerializeType<"timestamp">>value).value._nanoseconds
      );
    } else if ((<ImportSource>value)["__datatype__"] === "documentReference") {
      return this.connection.doc(
        (<SerializeType<"documentReference">>value).value
      );
    }

    throw new Error(
      "A type that cannot be saved in Firestore has been selected."
    );
  }

  /**
   * convertImportableType
   */
  private fromFirestoreSavableType(value: ImportableValue): ImportableValue {
    if (Array.isArray(value)) {
      return value.map((childValue) =>
        this.fromFirestoreSavableType(childValue)
      );
    }

    switch (value?.constructor.name) {
      case "GeoPoint":
        return {
          __datatype__: "geopoint",
          value: {
            _latitude: (<firestore.GeoPoint>value).latitude,
            _longitude: (<firestore.GeoPoint>value).longitude,
          },
        };
      case "Timestamp":
        return {
          __datatype__: "timestamp",
          value: {
            _seconds: (<firestore.Timestamp>value).seconds,
            _nanoseconds: (<firestore.Timestamp>value).nanoseconds,
          },
        };
      case "DocumentReference":
        return {
          __datatype__: "documentReference",
          value: (<firestore.DocumentReference>value).path,
        };
      case "Object":
        return Object.entries(value).reduce(
          (result, [key, value]) => ({
            ...result,
            [key]: this.fromFirestoreSavableType(value),
          }),
          {}
        );
      default:
        return value;
    }
  }
}
