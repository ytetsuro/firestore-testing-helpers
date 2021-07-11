import * as admin from 'firebase-admin';
import { FirebaseEmulatorConnectorStore } from '../FirebaseEmulatorConnectorStore';

export default {
    ...admin,
    initializeApp: () => FirebaseEmulatorConnectorStore.getConnector().getAdminApp(),
    firestore: Object.assign(() => FirebaseEmulatorConnectorStore.getConnector().getAdminFirestore(), admin.firestore)
}