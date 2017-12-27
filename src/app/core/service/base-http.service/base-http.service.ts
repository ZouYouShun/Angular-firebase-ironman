import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore } from 'angularfire2/firestore';

import { CollectionHandler } from './model/cloud-firestore/collection-handler.model';
import { DocumentHandler } from './model/cloud-firestore/document-handler.model';
import { ListHandler } from './model/realtime-database/list-handler.model';
import { ObjectHandler } from './model/realtime-database/object-handler.model';

@Injectable()
export class BaseHttpService {

  constructor(private _afs: AngularFirestore, private _db: AngularFireDatabase) { }

  collection<T>(url: string) {
    return new CollectionHandler<T>(this._afs, url);
  }

  document<T>(url: string) {
    return new DocumentHandler<T>(this._afs, url);
  }

  list<T>(url: string) {
    return new ListHandler<T>(this._db, url);
  }

  object<T>(url: string) {
    return new ObjectHandler<T>(this._db, url);
  }
}
