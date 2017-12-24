import { AngularFireDatabase, AngularFireList, QueryFn } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import { dbTimeObject } from './db.time.function';

export interface RealTimeDbConfig {
  isKey: boolean;
  queryFn?: QueryFn;
}

export class ListHandler {
  url: string;
  _fireList: AngularFireList<{}>;
  constructor(private _db: AngularFireDatabase, private _url) {
    this.url = _url;
    this._fireList = this._db.list(_url);
  }
  // get data
  get(config: RealTimeDbConfig = { isKey: true }) {
    const req = config.queryFn ?
      this._db.list(this.url, config.queryFn) : this._fireList;
    return config.isKey ?
      req.snapshotChanges().map(
        actions => actions.map(action => ({ id: action.key, ...action.payload.val() }))) :
      req.valueChanges();
  }

  // state(events?: ('added' | 'removed' | 'modified')[]) {
  //   return this._fireList.auditTrail();
  // }

  // 新增
  add<T>(data: T) {
    return Observable.fromPromise(this._fireList.push(dbTimeObject(data)));
  }
  // 刪除
  delete(key: string): Observable<any> {
    return key ?
      Observable.fromPromise(this._fireList.remove(key)) :
      Observable.throw(new Error('no key!'));
  }
  // 修改
  update<T>(key, data: T) {
    return Observable.fromPromise(this._fireList.update(key, dbTimeObject(data, false)));
  }
  // 設定
  set<T>(key, data: T) {
    return Observable.fromPromise(this._fireList.set(key, dbTimeObject(data, false)));
  }
  // 抹除
  drop() {
    return Observable.fromPromise(this._fireList.remove());
  }
}
