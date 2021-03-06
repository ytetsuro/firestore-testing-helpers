# Firestore Testing Helpers
---

This project is under development.

Please feel free to PullRequest and Issue.

---

This repository provides several helpers to facilitate testing in environments that use Firestore.

## Installation

```bash
$ npm i -D firestore-testing-helpers
```

## Emulator Connector Store

It provides an independent Firebase Connection for each test.
Thus, you will be relieved from a very annoying test with runInBand.

```typescript
import { FirebaseEmulatorConnectorStore } from "firestore-testing-helpers";
import { target } from '../path/to/test/target';


describe('User', () => {
  let connection;
  beforeAll(() => {
    connection = FirebaseEmulatorConnectorStore.getConnector().getAdminApp().firestore();
  });
...
});
```

## Seeder

Helper to import fixture to firestore easily.
It provides the ability to import specific data to a specific path as shown below.

```typescript
import {Seeder} from 'firestore-testing-helpers';

export class UserSeeder extends Seeder {
  protected call() {
     return this.import('users', {
       john: {
         name: 'John',
         age: 28,
         __collections__: {}
       }
     });
  }
}
```

Seeder is very simple, just run the run method at test time.

```typescript
import { FirebaseEmulatorConnectorStore } from "firestore-testing-helpers";
import { UserSeeder } from './fixtures/UserSeeder';

describe('User', () => {
  beforeAll(() => {
    return (new UserSeeder(FirestoreEmulatorConnectorStore.getConnector().getAdminFirestore())).run();
  });
...
});
```

### Export

If you want to export the existing remote firestore data, please execute the following command.

```bash
$ firestore-export -a /path/to/serviceAccount.json -p collection/document
```
