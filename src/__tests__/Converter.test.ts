import { firestore } from "firebase-admin";
import { FirebaseEmulatorConnectorStore } from "../FirebaseEmulatorConnectorStore";
import { Converter } from "../Converter";

describe("Converter", () => {
  let connection: firestore.Firestore;
  let converter: Converter;
  beforeAll(() => {
    const connector = FirebaseEmulatorConnectorStore.getConnector();
    connection = connector.getAdminFirestore();
    converter = new Converter(connection);
  });

  describe("Should be able to convert to firestore importable type.", () => {
    it("Each value is converted to an importable format.", () => {
      const actual = converter.toFirestore({
        string: "string",
        number: 1.1,
        map: {
          key: "value",
        },
        array: [
          {
            key: 1,
          },
        ],
        dataType: {
          timestamp: {
            __datatype__: "timestamp",
            value: {
              _seconds: 1624176138,
              _nanoseconds: 162417613,
            },
          },
          geoPoint: {
            __datatype__: "geopoint",
            value: {
              _latitude: 39.0641594,
              _longitude: 140.5221712,
            },
          },
          documentReference: {
            __datatype__: "documentReference",
            value: "abc/bcc",
          },
        },
      });

      expect(actual).toStrictEqual({
        string: "string",
        number: 1.1,
        map: {
          key: "value",
        },
        array: [
          {
            key: 1,
          },
        ],
        dataType: {
          timestamp: new firestore.Timestamp(1624176138, 162417613),
          geoPoint: new firestore.GeoPoint(39.0641594, 140.5221712),
          documentReference: connection.doc("abc/bcc"),
        },
      });
    });
    it("Should throw Error when unknown dataType.", () => {
      let isThrow = false;
      try {
        converter.toFirestore({
          key: {
            __datatype__: "unknown",
            value: 1,
          },
        });
      } catch (_) {
        isThrow = true;
      }

      expect(isThrow).toBe(true);
    });
    it("Should ignore __collections__ property.", () => {
      const actual = converter.toFirestore({
        __collections__: {
          key: {
            key: "value",
          },
        },
      });

      expect(actual).toStrictEqual({});
    });
  });

  describe("Should be able to convert to serialized data.", () => {
    it("Should be able to convert to serialized data.", async () => {
      const doc = connection.doc("collection/document");
      await connection.doc("collection/document").set({
        string: "string",
        number: 1.1,
        map: {
          key: "value",
        },
        array: [
          {
            key: 1,
          },
        ],
        dataType: {
          timestamp: new firestore.Timestamp(1624176138, 162417000),
          geoPoint: new firestore.GeoPoint(39.0641594, 140.5221712),
          documentReference: connection.doc("abc/bcc"),
        },
      });

      const data = await doc.get();
      const actual = converter.fromFirestore(
        <firestore.QueryDocumentSnapshot>data
      );

      expect(actual).toStrictEqual({
        string: "string",
        number: 1.1,
        map: {
          key: "value",
        },
        array: [
          {
            key: 1,
          },
        ],
        dataType: {
          timestamp: {
            __datatype__: "timestamp",
            value: {
              _seconds: 1624176138,
              _nanoseconds: 162417000,
            },
          },
          geoPoint: {
            __datatype__: "geopoint",
            value: {
              _latitude: 39.0641594,
              _longitude: 140.5221712,
            },
          },
          documentReference: {
            __datatype__: "documentReference",
            value: "abc/bcc",
          },
        },
      });
    });
  });
});
