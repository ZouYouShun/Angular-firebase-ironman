import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import { dbTimeObject } from './db.time.function';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { map } from 'rxjs/operators';

export class ObjectHandler<T> {
  url: string;
  _fireObject: AngularFireObject<{}>;
  constructor(private _db: AngularFireDatabase, private _url) {
    this.url = _url;
    this._fireObject = this._db.object(_url);
  }
  // get data
  get(isKey = true) {
    return isKey ?
      this._fireObject.snapshotChanges().pipe(
        map(action => ({ id: action.key, ...action.payload.val() }))
      ) :
      this._fireObject.valueChanges();
  }
  // 刪除
  delete(): Observable<any> {
    return fromPromise(this._fireObject.remove());
  }
  // 修改
  update(data: T) {
    return fromPromise(this._fireObject.update(dbTimeObject(data, false)));
  }
  // 設定
  set(data: T) {
    return fromPromise(this._fireObject.set(dbTimeObject(data, false)));
  }
}
