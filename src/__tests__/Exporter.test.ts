import { FirebaseEmulatorConnectorStore } from "../FirebaseEmulatorConnectorStore";
import { FirebaseEmulatorConnector } from "../FirebaseEmulatorConnector";
import { Exporter } from "../Exporter";
import { Seeder } from "../Seeder";

describe("Exporter", () => {
  const connector: FirebaseEmulatorConnector = FirebaseEmulatorConnectorStore.getConnector();
  beforeAll(async () => {

    await new (class extends Seeder {
      protected async call() {
        return this.import("collection", {
          documentA: {
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
            __collections__: {
              subCollection: {
                childDocument: {
                  key: "value",
                  __collections__: {},
                },
              },
            },
          },
          documentB: {
            key: "value",
            __collections__: {},
          },
        });
      }
    })(connector.getAdminFirestore()).run();
  });

  afterAll(() => {
    return connector.clearFirestore();
  });

  describe("Should be able to export firestore.", () => {
    it("Should be able to export firestore document.", async () => {
      const exporter = new Exporter(connector.getAdminFirestore());
      const actual = await exporter.export("collection/documentA");

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
        __collections__: {
          subCollection: {
            childDocument: {
              key: "value",
              __collections__: {},
            },
          },
        },
      });
    });
    it("Should be able to export firestore collection.", async () => {
      const exporter = new Exporter(connector.getAdminFirestore());
      const actual = await exporter.export("collection");

      expect(actual).toStrictEqual({
        documentA: {
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
              childDocument: {
                key: "value",
                __collections__: {},
              },
            },
          },
        },
        documentB: {
          key: "value",
          __collections__: {},
        },
      });
    });
  });
});
