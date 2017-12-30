import * as firebase from 'firebase';
export class Base {
  id: string;
  metadata: firebase.firestore.SnapshotMetadata;
  doc: firebase.firestore.DocumentSnapshot;
}
