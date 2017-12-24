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

  collection(url: string) {
    return new CollectionHandler(this._afs, url);
  }

  document(url: string) {
    return new DocumentHandler(this._afs, url);
  }

  list(url: string) {
    return new ListHandler(this._db, url);
  }

  object(url: string) {
    return new ObjectHandler(this._db, url);
  }
}
