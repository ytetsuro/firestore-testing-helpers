import crypto from "crypto";
import { FirebaseEmulatorConnector } from "./FirebaseEmulatorConnector";

export class FirebaseEmulatorConnectorStore {
  private static instances = new Map<string, FirebaseEmulatorConnector>();
  private static generateIdentity: () => string = () =>
    (<any>global.jasmine ?? {}).testPath; // eslint-disable-line @typescript-eslint/no-explicit-any

  static setIdentityGenerator(identityGenerator: () => string) {
    this.generateIdentity = identityGenerator;
  }

  static getConnector() {
    const identity: string = FirebaseEmulatorConnectorStore.generateIdentity();

    if (!FirebaseEmulatorConnectorStore.instances.has(identity)) {
      const projectId = crypto
        .createHash("sha1")
        .update(identity)
        .digest("hex");

      FirebaseEmulatorConnectorStore.instances.set(
        identity,
        new FirebaseEmulatorConnector(projectId)
      );
    }

    return FirebaseEmulatorConnectorStore.instances.get(identity)!;
  }

  static destroy() {
    const identity: string = FirebaseEmulatorConnectorStore.generateIdentity();

    if (FirebaseEmulatorConnectorStore.instances.has(identity)) {
      FirebaseEmulatorConnectorStore.instances.get(identity)!.cleanup();
    }
  }
}
