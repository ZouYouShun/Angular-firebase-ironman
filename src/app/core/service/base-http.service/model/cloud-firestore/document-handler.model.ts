import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { storeTimeObject } from './store.time.function';


export class DocumentHandler<T> {
  url: string;
  _fireAction: AngularFirestoreDocument<T>;
  constructor(private _afs: AngularFirestore, private _url) {
    this.url = _url;
    this._fireAction = this._afs.doc<T>(_url);
  }
  // 取得資料
  get(isKey = true): Observable<T> {
    return isKey ?
      this._fireAction.snapshotChanges().map(a => {
        const metadata = a.payload.metadata;
        const data = a.payload.data();
        const id = a.payload.id;
        return ({ id, metadata, ...data }) as any;
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
}
