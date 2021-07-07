# Firestore Testing Helpers
---

This project is under development.

Please feel free to PullRequest and Issue.

---

This repository provides several helpers to facilitate testing in environments that use Firestore.

## Emulator Connector Store

It provides an independent Firestore Connection for each test.
Thus, you will be relieved from a very annoying test with runInBand.

```typescript
import { FirestoreEmulatorConnectorStore } from "firestore-testing-helpers";
import { target } from '../path/to/test/target';


describe('User', () => {
  let connection;
  beforeAll(async () => {
    connection = await FirestoreEmulatorConnectorStore.getConnector();
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
import { FirestoreEmulatorConnectorStore } from "firestore-testing-helpers";
import { UserSeeder } from './fixtures/UserSeeder';

describe('User', () => {
  beforeAll(async () => {
    return (new UserSeeder(await FirestoreEmulatorConnectorStore.getConnector())).run();
  });
...
});
```

