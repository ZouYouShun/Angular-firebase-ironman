import * as firebase from 'firebase';
export class BaseModel {
  id?: string;
  metadata?: firebase.firestore.SnapshotMetadata;
  doc?: firebase.firestore.DocumentSnapshot;
  ref?: firebase.firestore.DocumentReference;
}
