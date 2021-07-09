import * as firebase from "@firebase/rules-unit-testing";
import {
  AppOptions,
  TokenOptions,
} from "@firebase/rules-unit-testing/dist/src/api/index";
import crypto from "crypto";
import { app } from "firebase-admin";

export class FirebaseEmulatorConnector {
  private adminFirebaseApp: app.App | null = null;
  private firebaseApps: Map<
    string,
    ReturnType<typeof firebase.initializeTestApp>
  > = new Map();

  constructor(private readonly projectId: string) {}

  getAdminApp() {
    if (this.adminFirebaseApp === null) {
      this.adminFirebaseApp = firebase.initializeAdminApp({
        projectId: this.projectId,
      });
    }

    return this.adminFirebaseApp!;
  }

  getAdminFirestore() {
    return this.getAdminApp().firestore();
  }

  getApp(auth?: TokenOptions) {
    const optionHash = crypto
      .createHash("sha1")
      .update(JSON.stringify(auth ?? {}))
      .digest("hex");

    if (!this.firebaseApps.has(optionHash)) {
      const config: AppOptions = {
        projectId: this.projectId,
        auth: auth ? auth : undefined,
      };

      this.firebaseApps.set(optionHash, firebase.initializeTestApp(config));
    }

    return this.firebaseApps.get(optionHash)!;
  }

  getFirestore(auth?: TokenOptions) {
    return this.getApp(auth).firestore();
  }

  clearFirestore() {
    return firebase.clearFirestoreData({ projectId: this.projectId });
  }

  cleanup() {
    this.adminFirebaseApp?.delete?.();
    this.adminFirebaseApp = null;
    this.firebaseApps.forEach((app) => app?.delete?.());
    this.firebaseApps.clear();
  }
}
