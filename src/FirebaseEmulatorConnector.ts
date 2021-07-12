import * as firebase from "@firebase/rules-unit-testing";
import {
  AppOptions,
  TokenOptions,
} from "@firebase/rules-unit-testing/dist/src/api/index";
import crypto from "crypto";
import * as admin from "firebase-admin";

export class FirebaseEmulatorConnector {
  private adminFirebaseApp: admin.app.App | null = null;
  private firebaseApps: Map<
    string,
    ReturnType<typeof firebase.initializeTestApp>
  > = new Map();

  constructor(private readonly projectId: string) {}

  getAdminApp() {
    if (this.adminFirebaseApp === null) {
      this.adminFirebaseApp = admin.initializeApp({
        projectId: this.projectId,
      }, this.getRandomName());

      this.adminFirebaseApp.firestore().settings({
        host: this.getFirestoreHost(),
        ssl: false,
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

  private getFirestoreHost() {
    return process.env.FIRESTORE_EMULATOR_HOST ?? 'localhost:8080';
  }

  private getRandomName() {
    return `firestore-testing-helpers-${this.projectId}-${(new Date).getTime()}-${Math.random()}`;
  }
}
