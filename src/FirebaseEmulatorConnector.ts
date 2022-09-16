import * as firebase from "@firebase/rules-unit-testing";
import crypto from "crypto";
import * as admin from "firebase-admin";

export class FirebaseEmulatorConnector {
  private adminFirebaseApp: admin.app.App | null = null;
  private firebaseApps: Map<
    string,
    firebase.RulesTestContext
  > = new Map();

  private testEnv?: firebase.RulesTestEnvironment;

  constructor(private readonly projectId: string) {}

  private async getTestEnv() {
    if (!this.testEnv) {
      this.testEnv = await firebase.initializeTestEnvironment({
        projectId: this.projectId,
      });
    }

    return this.testEnv;
  }

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

  async getApp(uid?: string) {
    const optionHash = crypto
      .createHash("sha1")
      .update(JSON.stringify(uid ?? {}))
      .digest("hex");

    if (!this.firebaseApps.has(optionHash)) {
      const testEnv = await this.getTestEnv();
      const clientApp = uid ? testEnv.authenticatedContext(uid) : testEnv.unauthenticatedContext();

      this.firebaseApps.set(optionHash, clientApp);
    }

    return this.firebaseApps.get(optionHash)!;
  }

  async getFirestore(uid?: string) {
    return (await this.getApp(uid)).firestore();
  }

  clearFirestore() {
    return (this.getTestEnv()).then(testEnv => testEnv.clearFirestore());
  }

  cleanup() {
    this.adminFirebaseApp?.delete?.();
    this.adminFirebaseApp = null;
    this.firebaseApps.clear();
  }

  private getFirestoreHost() {
    return process.env.FIRESTORE_EMULATOR_HOST ?? 'localhost:8080';
  }

  private getRandomName() {
    return `firestore-testing-helpers-${this.projectId}-${(new Date).getTime()}-${Math.random()}`;
  }
}
