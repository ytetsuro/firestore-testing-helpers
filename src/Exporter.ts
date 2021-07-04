import { firestore } from "firebase-admin";
import { Converter } from "./Converter";
import { DocumentImportSource } from "./FirestoreDataSource";

export class Exporter {
  private readonly converter: Converter;

  constructor(protected readonly connection: firestore.Firestore) {
    this.converter = new Converter(connection);
  }

  async export(path: string) {
    const isCollectionPath =
      path.replace(/(^\/)|(\/$)/g, "").split("/").length % 2 !== 0;

    if (isCollectionPath) {
      const collection = this.connection.collection(path);
      return (await this.exportCollection(collection))[collection.id];
    }

    const document = this.connection.doc(path);
    return (await this.exportDocument(document))[document.id];
  }

  private async exportCollection(collection: firestore.CollectionReference) {
    const snapshot = await collection.withConverter(this.converter).get();
    const docs = await Promise.all(
      snapshot.docs.map((doc) => this.exportDocument(doc))
    );

    return {
      [collection.id]: docs.reduce(
        (docs, doc) => ({
          ...docs,
          ...doc,
        }),
        {}
      ),
    };
  }

  private exportDocument(
    document: firestore.DocumentSnapshot
  ): Promise<{ [key: string]: DocumentImportSource }>;
  private exportDocument(
    document: firestore.DocumentReference
  ): Promise<{ [key: string]: DocumentImportSource }>;

  private async exportDocument(
    document: firestore.DocumentReference | firestore.DocumentSnapshot
  ): Promise<{ [key: string]: DocumentImportSource }> {
    const data =
      document instanceof firestore.DocumentSnapshot
        ? document
        : await document.withConverter(this.converter).get();

    return {
      [data.id]: {
        ...data.data(),
        __collections__: await this.exportSubCollection(data.ref),
      },
    };
  }

  private async exportSubCollection(document: firestore.DocumentReference) {
    const collections = await Promise.all(
      (
        await document.listCollections()
      ).map((collection) => this.exportCollection(collection))
    );

    return collections.reduce(
      (collections, collection) => ({
        ...collections,
        ...collection,
      }),
      {}
    );
  }
}
