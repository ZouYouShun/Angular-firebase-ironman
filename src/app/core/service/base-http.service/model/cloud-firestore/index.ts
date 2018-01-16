import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { storeTimeObject } from './store.time.function';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { fromPromise } from 'rxjs/observable/fromPromise';

export interface CloudFirestoreConfig {
  isKey: boolean;
  queryFn?: QueryFn;
}

function handleError(error) {
  console.log(error);
  return ErrorObservable.create(new Error(error));
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
    if (!this.url) return of(null);
    const req = config.queryFn ?
      this._afs.collection(this.url, config.queryFn) : this._fireAction;
    return config.isKey ?
      req.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            if (a.payload.doc.exists) {
              const metadata = a.payload.doc.metadata;
              const ref = a.payload.doc.ref;
              const data = a.payload.doc.data();
              const doc = a.payload.doc;
              const id = a.payload.doc.id;
              return { id, doc, ref, metadata, ...data };
            }
            return null;
          }) as any;
        }),
        catchError(error => handleError(error))
      ) :
      req.valueChanges();
  }

  add(data: T): Observable<DocumentHandler<T>> {
    if (!this.url) return of(null);
    return fromPromise(this._fireAction.add(storeTimeObject(data))).pipe(
      map(d => this.document<T>(d.id)),
      catchError(error => handleError(error))
    );
  }

  delete(key: string): Observable<any> {
    if (!this.url) return of(null);
    return key ?
      fromPromise(this._fireAction.doc(key).delete()).pipe(
        map(() => key),
        catchError(error => handleError(error))
      ) :
      ErrorObservable.create(new Error('no key!'));
  }

  update(key, data: T): Observable<string> {
    if (!this.url) return of(null);
    return fromPromise(
      this._fireAction
        .doc(key)
        .update(storeTimeObject(data, false))).pipe(
      map(() => key),
      catchError(error => handleError(error))
      );
  }

  set(key, data: T) {
    if (!this.url) return of(null);
    return fromPromise(this._fireAction.doc(key).set(storeTimeObject(data))).pipe(
      map(() => this.document(key)),
      catchError(error => handleError(error))
    );
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
    if (!this.url) return of(null);

    return isKey ?
      this._fireAction.snapshotChanges().pipe(
        map(a => {
          if (a.payload.exists) {
            const ref = a.payload.ref;
            const metadata = a.payload.metadata;
            const data = a.payload.data();
            const id = a.payload.id;
            return ({ id, metadata, ref, ...data }) as any;
          }
          return null;
        }),
        catchError(error => handleError(error))
      ) :
      this._fireAction.valueChanges();
  }
  // 刪除
  delete(): Observable<any> {
    if (!this.url) return of(null);
    return fromPromise(this._fireAction.delete()).pipe(
      catchError(error => handleError(error))
    );
  }
  // 修改
  update(data: T, updateDate = true) {
    if (!this.url) return of(null);
    const obj = updateDate ? storeTimeObject(data, false) : data;
    return fromPromise(this._fireAction.update(obj)).pipe(
      catchError(error => handleError(error))
    );
  }
  // 設定
  set(data: T, isCreated = true) {
    if (!this.url) return of(null);
    return fromPromise(this._fireAction.set(storeTimeObject(data, isCreated))).pipe(
      catchError(error => handleError(error))
    );
  }

  collection<K>(path: string) {
    if (path) {
      return new CollectionHandler<K>(this._afs, this._fireAction.collection(path));
    }
    return new CollectionHandler<K>(this._afs, null);
  }
}
