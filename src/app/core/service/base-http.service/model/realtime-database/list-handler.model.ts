import { AngularFireDatabase, AngularFireList, QueryFn } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import { dbTimeObject } from './db.time.function';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { map } from 'rxjs/operators';

export interface RealTimeDbConfig {
  isKey: boolean;
  queryFn?: QueryFn;
}

export class ListHandler<T> {
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
      req.snapshotChanges().pipe(
        map(actions => actions.map(action => ({ id: action.key, ...action.payload.val() })))
      ) :
      req.valueChanges();
  }

  // getById(events?: ('added' | 'removed' | 'modified')[]) {
  //   return this._fireList.auditTrail();
  // }

  // 新增
  add(data: T) {
    return fromPromise(this._fireList.push(dbTimeObject(data)));
  }
  // 刪除
  delete(key: string): Observable<any> {
    return key ?
      fromPromise(this._fireList.remove(key)) :
      ErrorObservable.create(new Error('no key!'));
  }
  // 修改
  update(key, data: T) {
    return fromPromise(this._fireList.update(key, dbTimeObject(data, false)));
  }
  // 設定
  set(key, data: T) {
    return fromPromise(this._fireList.set(key, dbTimeObject(data, false)));
  }
  // 抹除
  drop() {
    return fromPromise(this._fireList.remove());
  }
}
