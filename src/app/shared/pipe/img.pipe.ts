import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { BaseHttpService } from '@core/service/base-http.service';
import { of } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators';

@Pipe({
  name: 'img'
})
export class ImgPipe implements PipeTransform {
  constructor(private _storage: AngularFireStorage, private _http: BaseHttpService) { }

  transform(path: string): any {
    // console.log(path);
    return this._storage.ref(path).getDownloadURL().pipe(
      catchError((err) => {
        // console.log('file not exist!');
        return of(null);
      })
    );
    // return this._http.document(`files/${path}`).get()
    //   .do(d => console.log(d))
    //   .map((f: any) => f.thumbnail)
    //   .catch((err) => {
    //     // console.log('file not exist!');
    //     return Observable.of(null);
    //   });
  }
}
