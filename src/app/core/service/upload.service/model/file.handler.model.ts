import 'rxjs/add/observable/fromPromise';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';

export class FileHandler<T> {
  path: string;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;

  constructor(_storage: AngularFireStorage, filePath: string) {
    this.path = filePath;
    this.ref = _storage.ref(filePath);
  }

  get() {
    return this.ref.getDownloadURL();
  }

  upload(obj: { file: File, data?: T }): Observable<firebase.storage.UploadTaskSnapshot> {
    this.task = obj.data ?
      this.ref.put(obj.file, { customMetadata: <any>obj.data }) :
      this.ref.put(obj.file);
    return Observable.fromPromise(this.task.then());
  }

  edit(obj: { file?: File, data: T }) {
    if (obj.file) {
      return this.upload({ file: obj.file, data: obj.data });
    }
    return this.ref.updateMetatdata({ customMetadata: <any>obj.data });
  }

  delete() {
    return this.ref.delete().map(() => this.path);
  }
}
