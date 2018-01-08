import { Injectable } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { FileHandler } from './model/file.handler.model';
import { FileError } from 'ngxf-uploader';
import { AlertConfirmService } from '@core/component/alert-confirm';

@Injectable()
export class UploadService {

  constructor(
    private _storage: AngularFireStorage,
    private _alc: AlertConfirmService) { }

  fileHandler<T>(path: string) {
    return new FileHandler<T>(this._storage, path);
  }

  fileErrorHandler(errror: FileError) {
    switch (errror) {
      case FileError.NumError:
        this._alc.alert('檔案數量錯誤');
        break;
      case FileError.SizeError:
        this._alc.alert('檔案大小錯誤');
        break;
      case FileError.TypeError:
        this._alc.alert('檔案格式錯誤');
        break;
    }
  }
}
