import { AngularFirestore, AngularFirestoreCollection, QueryFn } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { storeTimeObject } from './store.time.function';

export interface CloudFirestoreConfig {
  isKey: boolean;
  queryFn?: QueryFn;
}

export class CollectionHandler {
  url: string;
  _fireAction: AngularFirestoreCollection<{}>;
  constructor(private _afs: AngularFirestore, private _url) {
    this.url = _url;
    this._fireAction = this._afs.collection(_url);
  }

  get(config: CloudFirestoreConfig = { isKey: true }): Observable<any> {
    const req = config.queryFn ?
      this._afs.collection(this.url, config.queryFn) : this._fireAction;
    return config.isKey ?
      req.snapshotChanges().map(actions => {
        return actions.map(a => {
          const metadata = a.payload.doc.metadata;
          const data = a.payload.doc.data();
          const doc = a.payload.doc;
          const id = a.payload.doc.id;
          return { id, doc, metadata, ...data };
        });
      }) :
      req.valueChanges();
  }

  getById(key) {
    return this._fireAction.doc(key);
  }

  // state(events?: ('added' | 'removed' | 'modified')[]) {
  //   return this._fireAction.auditTrail();
  // }

  add<T>(data: object): Observable<any> {
    return Observable.fromPromise(
      this._fireAction
        .add(storeTimeObject(data))).map(d => d.id);
  }

  delete(key: string): Observable<any> {
    return key ?
      Observable.fromPromise(this._fireAction.doc(key).delete()) :
      Observable.throw(new Error('no key!'));
  }

  update<T>(key, data: T) {
    return Observable.fromPromise(
      this._fireAction
        .doc(key)
        .update(storeTimeObject(data, false)));
  }

  set<T>(key, data: T) {
    return Observable.fromPromise(
      this._fireAction
        .doc(key)
        .set(storeTimeObject(data, false)));
  }
}
