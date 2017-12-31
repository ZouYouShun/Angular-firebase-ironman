import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

@Pipe({
  name: 'img'
})
export class ImgPipe implements PipeTransform {
  constructor(private _storage: AngularFireStorage) { }

  transform(path: string): any {
    // console.log(path);
    return this._storage.ref(path).getDownloadURL()
      .catch((err) => {
        // console.log('file not exist!');
        return Observable.of('assets/img/avatar.jpg');
      });
  }
}
