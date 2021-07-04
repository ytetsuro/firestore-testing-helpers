#!/usr/bin/env node
import commander from "commander";
import { existsSync } from "fs";
import loadJsonFile from "load-json-file";
import * as admin from "firebase-admin";
import { Exporter } from "../Exporter";

commander
  .requiredOption(
    "-a, --accountCredentials <path>",
    "path to Google Cloud account credentials JSON file."
  )
  .requiredOption(
    `-p, --path <path>`,
    "Path to database node (has to be a collection) where export will to start (e.g. collectionA/docB/collectionC)."
  )
  .parse(process.argv);

const serviceAccountJsonPath = commander["accountCredentials"];
const firestoreNodePath = commander["path"];

const main = async () => {
  if (!existsSync(serviceAccountJsonPath)) {
    throw new Error(
      `Account credentials file does not exist: ${serviceAccountJsonPath}`
    );
  }

  const serviceAccount = await loadJsonFile<admin.ServiceAccount>(
    serviceAccountJsonPath
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
  });
  const firestoreInstance = admin.firestore();
  const exporter = new Exporter(firestoreInstance);

  console.log(await exporter.export(firestoreNodePath));
};

main();
