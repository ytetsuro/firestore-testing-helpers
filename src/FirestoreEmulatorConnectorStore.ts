import crypto from "crypto";
import { FirestoreEmulatorConnector } from "./FirestoreEmulatorConnector";

export class FirestoreEmulatorConnectorStore {
  private static instances = new Map<string, FirestoreEmulatorConnector>();
  private static generateIdentity: () => string = () =>
    (<any>global.jasmine ?? {}).testPath; // eslint-disable-line @typescript-eslint/no-explicit-any

  static setIdentityGenerator(identityGenerator: () => string) {
    this.generateIdentity = identityGenerator;
  }

  static async getConnector() {
    const identity: string = FirestoreEmulatorConnectorStore.generateIdentity();

    if (!FirestoreEmulatorConnectorStore.instances.has(identity)) {
      const projectId = crypto
        .createHash("sha1")
        .update(identity)
        .digest("hex");

      FirestoreEmulatorConnectorStore.instances.set(
        identity,
        new FirestoreEmulatorConnector(projectId)
      );
    }

    return FirestoreEmulatorConnectorStore.instances.get(identity)!;
  }

  static destroy() {
    const identity: string = FirestoreEmulatorConnectorStore.generateIdentity();

    if (FirestoreEmulatorConnectorStore.instances.has(identity)) {
      FirestoreEmulatorConnectorStore.instances.get(identity)!.cleanup();
    }
  }
}
