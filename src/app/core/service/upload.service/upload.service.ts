import { Injectable } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { FileHandler } from './model/file.handler.model';

@Injectable()
export class UploadService {

  constructor(private _storage: AngularFireStorage) { }

  fileHandler<T>(path: string) {
    return new FileHandler<T>(this._storage, path);
  }

}
