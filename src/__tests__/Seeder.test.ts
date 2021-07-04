import { firestore } from "firebase-admin";
import { FirestoreEmulatorConnector } from "../FirestoreEmulatorConnector";
import { FirestoreEmulatorConnectorStore } from "../FirestoreEmulatorConnectorStore";
import { Seeder } from "../Seeder";

describe("Seeder", () => {
  let connector: FirestoreEmulatorConnector;
  beforeAll(async () => {
    connector = await FirestoreEmulatorConnectorStore.getConnector();
  });

  beforeEach(() => {
    return connector.clearFirestore();
  });

  describe("Should be able to import into firestore.", () => {
    it("Should be able to import into collection.", async () => {
      const MySeeder = class extends Seeder {
        protected async call() {
          return this.import("collection", {
            documentA: {
              string: "string",
              __collections__: {},
            },
            documentB: {
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
              __collections__: {
                subCollection: {
                  documentId: {
                    string: "this is sub collection",
                    __collections__: {},
                  },
                },
              },
            },
          });
        }
      };
      const connection = connector.getAdminFirestore();

      await new MySeeder(connection).run();

      const [collection, subCollectionDocument] = await Promise.all([
        connection.collection("collection").get(),
        connection.doc("collection/documentB/subCollection/documentId").get(),
      ]);

      expect(collection.docs.length).toBe(2);
      expect(collection.docs[0].data()).toStrictEqual({
        string: "string",
      });
      expect(collection.docs[1].data()).toStrictEqual({
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
      expect(subCollectionDocument.data()).toStrictEqual({
        string: "this is sub collection",
      });
    });
    it("Should be able to import into document and sub collection.", async () => {
      const MySeeder = class extends Seeder {
        protected async call() {
          return this.import("collection/document", {
            __collections__: {
              subCollection: {
                documentId: {
                  string: "string",
                  __collections__: {},
                },
              },
            },
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
        }
      };
      const connection = connector.getAdminFirestore();

      await new MySeeder(connection).run();

      const [document, subCollectionDocument] = await Promise.all([
        connection.doc("collection/document").get(),
        connection.doc("collection/document/subCollection/documentId").get(),
      ]);

      expect(document.data()).toStrictEqual({
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
      expect(subCollectionDocument.data()).toStrictEqual({
        string: "string",
      });
    });
    it("Should be able to import into depends.", async () => {
      const DependsSeeder = class extends Seeder {
        protected async call() {
          return this.import("depends/target", {
            __collections__: {},
            depends: "A",
          });
        }
      };
      const MySeeder = class extends Seeder {
        protected readonly depends = [DependsSeeder];

        protected async call() {
          const target = await this.connection.doc("depends/target").get();

          return this.import("import/target", {
            __collections__: {},
            target: target.get("depends"),
          });
        }
      };
      const connection = connector.getAdminFirestore();

      await new MySeeder(connection).run();

      const snapshot = await connection.doc("import/target").get();

      expect(snapshot.data()).toStrictEqual({
        target: "A",
      });
    });
  });
});
