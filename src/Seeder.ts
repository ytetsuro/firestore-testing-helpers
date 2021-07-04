import { firestore } from "firebase-admin";
import { Converter } from "./Converter";
import {
  CollectionImportSource,
  DocumentImportSource,
  FirestoreImportSource,
  ImportSource,
} from "./FirestoreDataSource";

type SeederConstructor = new (connection: firestore.Firestore) => Seeder;

export abstract class Seeder {
  protected readonly depends: SeederConstructor[] = [];
  private readonly converter: Converter;

  constructor(protected readonly connection: firestore.Firestore) {
    this.converter = new Converter(connection);
  }

  async run(): Promise<void> {
    return Promise.all(
      this.depends
        .map((DependsSeeder) => new DependsSeeder(this.connection))
        .map((dependsSeeder) => dependsSeeder.run())
    ).then(() => this.call());
  }

  protected abstract call(): Promise<void>;

  protected import<T extends string>(
    path: T,
    data: FirestoreImportSource<T>
  ): Promise<void> {
    const isCollectionPath =
      path.replace(/(^\/)|(\/$)/g, "").split("/").length % 2 !== 0;
    const bulkWriter = this.connection.bulkWriter();

    if (isCollectionPath) {
      return this.collectionImport(
        path,
        <CollectionImportSource>data,
        bulkWriter
      ).close();
    }

    return this.documentImport(
      path,
      <DocumentImportSource>data,
      bulkWriter
    ).close();
  }

  private collectionImport(
    path: string,
    data: ImportSource,
    bulkWriter: firestore.BulkWriter
  ) {
    const paths = path.replace(/(^\/)|(\/$)/g, "").split("/");
    const isCollectionPath = paths.length % 2 !== 0;
    const collections = isCollectionPath
      ? { [String(paths.pop())]: data }
      : data;

    return Object.entries(collections)
      .flatMap(([collectionName, collectionData]) =>
        Object.entries(collectionData).map(([documentName, documentData]) => ({
          path: paths.slice().concat(collectionName, documentName).join("/"),
          data: documentData,
        }))
      )
      .reduce(
        (bulkWriter, { path, data }) =>
          this.documentImport(path, <DocumentImportSource>data, bulkWriter),
        bulkWriter
      );
  }

  private documentImport(
    path: string,
    data: DocumentImportSource,
    bulkWriter: firestore.BulkWriter
  ) {
    bulkWriter.set(
      this.connection.doc(path).withConverter(this.converter),
      data
    );

    this.collectionImport(path, data["__collections__"], bulkWriter);

    return bulkWriter;
  }
}
