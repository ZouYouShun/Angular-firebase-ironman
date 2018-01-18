import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { storeTimeObject } from './store.time.function';
import { DocumentHandler } from './index';

export class BatchHandler {
  private _batch: firebase.firestore.WriteBatch;

  constructor(_afs: AngularFirestore) {
    this._batch = _afs.firestore.batch();
  }

  commit(): Observable<void> {
    return fromPromise(this._batch.commit());
  }

  set(
    documentHandler: DocumentHandler<any>,
    data: firebase.firestore.DocumentData,
    options?: firebase.firestore.SetOptions
  ) {
    this._batch.set(documentHandler.ref, storeTimeObject(data), options);
  }

  delete(documentHandler: DocumentHandler<any>) {
    this._batch.delete(documentHandler.ref);
  }

  update(documentHandler: DocumentHandler<any>, data: firebase.firestore.UpdateData) {
    this._batch.update(documentHandler.ref, storeTimeObject(data, false));
  }

}
