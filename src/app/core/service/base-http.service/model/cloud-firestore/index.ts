import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { storeTimeObject } from './store.time.function';

export interface CloudFirestoreConfig {
  isKey: boolean;
  queryFn?: QueryFn;
}

function handleError(error) {
  console.log(error);
  return Observable.throw(new Error(error));
}

export class CollectionHandler<T> {
  url: string;
  _fireAction: AngularFirestoreCollection<T>;
  constructor(
    private _afs: AngularFirestore,
    private _url: string | AngularFirestoreCollection<T>) {
    if (_url) {
      if (typeof (_url) === 'string') {
        this.url = _url;
        this._fireAction = this._afs.collection(_url);
      } else {
        const fireCollection = <AngularFirestoreCollection<T>>this._url;

        this._fireAction = fireCollection;
        this.url = this._fireAction.ref.path;
      }
    }
  }

  get(config: CloudFirestoreConfig = { isKey: true }): Observable<T> {
    if (!this.url) return Observable.of(null);
    const req = config.queryFn ?
      this._afs.collection(this.url, config.queryFn) : this._fireAction;
    return config.isKey ? req.snapshotChanges()
      .map(actions => {
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
      })
      .catch(error => handleError(error)) :
      req.valueChanges();
  }

  add(data: object): Observable<DocumentHandler<T>> {
    if (!this.url) return Observable.of(null);
    return Observable.fromPromise(this._fireAction.add(storeTimeObject(data)))
      .map(d => this.document<T>(d.id))
      .catch(error => handleError(error));
  }

  delete(key: string): Observable<any> {
    if (!this.url) return Observable.of(null);
    return key ?
      Observable.fromPromise(this._fireAction.doc(key).delete())
        .map(() => key)
        .catch(error => handleError(error)) :
      Observable.throw(new Error('no key!'));
  }

  update(key, data: T): Observable<string> {
    if (!this.url) return Observable.of(null);
    return Observable.fromPromise(
      this._fireAction
        .doc(key)
        .update(storeTimeObject(data, false))).map(() => key)
      .catch(error => handleError(error));
  }

  set(key, data: T) {
    if (!this.url) return Observable.of(null);
    return Observable.fromPromise(this._fireAction.doc(key).set(storeTimeObject(data)))
      .map(() => this.document(key))
      .catch(error => handleError(error));
  }

  document<K>(path: string) {
    if (path) {
      return new DocumentHandler<K>(this._afs, this._fireAction.doc(path));
    }
    return new DocumentHandler<K>(this._afs, null);
  }
}

export class DocumentHandler<T> {
  url: string;
  id: string;
  _fireAction: AngularFirestoreDocument<T>;
  constructor(
    private _afs: AngularFirestore,
    private _url: string | AngularFirestoreDocument<T>) {
    if (_url) {
      if (typeof (_url) === 'string') {
        this._fireAction = this._afs.doc<T>(_url);

        this.url = _url;
        this.id = this._fireAction.ref.id;
      } else {
        const fireCollection = <AngularFirestoreDocument<T>>this._url;

        this._fireAction = fireCollection;
        this.url = this._fireAction.ref.path;
        this.id = this._fireAction.ref.id;
      }
    }
  }
  // 取得資料
  get(isKey = true): Observable<T> {
    if (!this.url) return Observable.of(null);

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
        })
        .catch(error => handleError(error)) :
      this._fireAction.valueChanges();
  }
  // 刪除
  delete(): Observable<any> {
    if (!this.url) return Observable.of(null);
    return Observable.fromPromise(this._fireAction.delete())
      .catch(error => handleError(error));
  }
  // 修改
  update(data: T) {
    if (!this.url) return Observable.of(null);
    return Observable.fromPromise(this._fireAction.update(storeTimeObject(data, false)))
      .catch(error => handleError(error));
  }
  // 設定
  set(data: T) {
    if (!this.url) return Observable.of(null);
    return Observable.fromPromise(this._fireAction.set(storeTimeObject(data)))
      .catch(error => handleError(error));
  }

  collection<K>(path: string) {
    if (path) {
      return new CollectionHandler<K>(this._afs, this._fireAction.collection(path));
    }
    return new CollectionHandler<K>(this._afs, null);
  }
}
