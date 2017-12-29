import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { storeTimeObject } from './store.time.function';

export interface CloudFirestoreConfig {
  isKey: boolean;
  queryFn?: QueryFn;
}

export class CollectionHandler<T> {
  url: string;
  _fireAction: AngularFirestoreCollection<T>;
  constructor(
    private _afs: AngularFirestore,
    private _url: string | AngularFirestoreCollection<T>) {
    if (typeof (_url) === 'string') {
      this.url = _url;
      this._fireAction = this._afs.collection(_url);
    } else {
      const fireCollection = <AngularFirestoreCollection<T>>this._url;

      this._fireAction = fireCollection;
      this.url = this._fireAction.ref.path;
    }
  }

  get(config: CloudFirestoreConfig = { isKey: true }): Observable<T> {
    const req = config.queryFn ?
      this._afs.collection(this.url, config.queryFn) : this._fireAction;
    return config.isKey ?
      req.snapshotChanges().map(actions => {
        return actions.map(a => {
          if (a.payload.doc.exists) {
            const metadata = a.payload.doc.metadata;
            const data = a.payload.doc.data();
            const doc = a.payload.doc;
            const id = a.payload.doc.id;
            return { id, doc, metadata, ...data };
          }
          return null;
        }) as any;
      }) :
      req.valueChanges();
  }

  getById(key, isKey = true): Observable<T> {
    return key ?
      (isKey ? this._fireAction.doc(key).snapshotChanges()
        .map(a => {
          if (a.payload.exists) {
            const metadata = a.payload.metadata;
            const data = a.payload.data();
            const id = a.payload.id;
            return { id, metadata, ...data } as any;
          }
          return null;
        }) : this._fireAction.valueChanges())
      : Observable.of(null);
  }

  // state(events?: ('added' | 'removed' | 'modified')[]) {
  //   return this._fireAction.auditTrail();
  // }

  add(data: object): Observable<DocumentHandler<{}>> {
    return Observable.fromPromise(
      this._fireAction
        .add(storeTimeObject(data))).map(d => this.document(d.id));
  }

  delete(key: string): Observable<any> {
    return key ?
      Observable.fromPromise(this._fireAction.doc(key).delete()).map(() => key) :
      Observable.throw(new Error('no key!'));
  }

  update(key, data: T): Observable<string> {
    return Observable.fromPromise(
      this._fireAction
        .doc(key)
        .update(storeTimeObject(data, false))).map(() => key);
  }

  set(key, data: T) {
    return Observable.fromPromise(
      this._fireAction
        .doc(key)
        .set(storeTimeObject(data))).map(() => this.document(key));
  }

  document<K>(path: string) {
    return new DocumentHandler<K>(this._afs, this._fireAction.doc(path));
  }
}

export class DocumentHandler<T> {
  url: string;
  _fireAction: AngularFirestoreDocument<T>;
  constructor(
    private _afs: AngularFirestore,
    private _url: string | AngularFirestoreDocument<T>) {
    if (typeof (_url) === 'string') {
      this.url = _url;
      this._fireAction = this._afs.doc<T>(_url);
    } else {
      const fireCollection = <AngularFirestoreDocument<T>>this._url;

      this._fireAction = fireCollection;
      this.url = this._fireAction.ref.path;
    }
  }
  // 取得資料
  get(isKey = true): Observable<T> {
    return isKey ?
      this._fireAction.snapshotChanges()
        .map(a => {
          if (a.payload.exists) {
            const metadata = a.payload.metadata;
            const data = a.payload.data();
            const id = a.payload.id;
            return ({ id, metadata, ...data }) as any;
          }
          return null;
        }) :
      this._fireAction.valueChanges();
  }
  // 刪除
  delete(): Observable<any> {
    return Observable.fromPromise(this._fireAction.delete());
  }
  // 修改
  update(data: T) {
    return Observable.fromPromise(
      this._fireAction
        .update(storeTimeObject(data, false)));
  }
  // 設定
  set(data: T) {
    return Observable.fromPromise(
      this._fireAction
        .set(storeTimeObject(data)));
  }

  collection<K>(path: string) {
    return new CollectionHandler<K>(this._afs, this._fireAction.collection(path));
  }
}
