import * as firebase from 'firebase';
export interface Base {
  id: string;
  metadata: firebase.firestore.SnapshotMetadata;
  doc: firebase.firestore.DocumentSnapshot;
}
