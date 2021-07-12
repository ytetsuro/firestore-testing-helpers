import * as admin from 'firebase-admin';
import { FirebaseEmulatorConnectorStore } from '../FirebaseEmulatorConnectorStore';

export = {
    ...admin,
    initializeApp: (_?: admin.AppOptions, __?: string) => FirebaseEmulatorConnectorStore.getConnector().getAdminApp(),
    firestore: Object.assign((_?: admin.app.App) => FirebaseEmulatorConnectorStore.getConnector().getAdminFirestore(), admin.firestore)
}