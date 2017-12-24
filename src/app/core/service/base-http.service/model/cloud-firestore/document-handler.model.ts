import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { storeTimeObject } from './store.time.function';


export class DocumentHandler {
  url: string;
  _fireAction: AngularFirestoreDocument<{}>;
  constructor(private _afs: AngularFirestore, private _url) {
    this.url = _url;
    this._fireAction = this._afs.doc(_url);
  }
  // 取得資料
  get(isKey = true): Observable<any> {
    return isKey ?
      this._fireAction.snapshotChanges().map(a => {
        const data = a.payload.data();
        const id = a.payload.id;
        return { id, ...data };
      }) :
      this._fireAction.valueChanges();
  }
  // 刪除
  delete(): Observable<any> {
    return Observable.fromPromise(this._fireAction.delete());
  }
  // 修改
  update<T>(data: T) {
    return Observable.fromPromise(
      this._fireAction
        .update(storeTimeObject(data, false)));
  }
  // 設定
  set<T>(data: T) {
    return Observable.fromPromise(
      this._fireAction
        .set(storeTimeObject(data, false)));
  }
}
