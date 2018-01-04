import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/do';

import { AngularFireDatabase, AngularFireList, QueryFn } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { BlockViewService } from '@core/service/block-view.service';
import { AlertConfirmService } from '@core/component/alert-confirm';

export interface MyHttpConfig {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

export class MyHttpHandler<T> {
  url: string;
  constructor(
    private _http: HttpClient,
    _url,
    private _block: BlockViewService,
    private _alc: AlertConfirmService,
    private platformId: Object) {
    this.url = _url;
  }

  get(options?: MyHttpConfig, isBlockView = true): Observable<T> {
    const getMethod = this._http.get<T>(this.url, options);
    return isBlockView ? this.next(getMethod) : this.noBlockNext(getMethod);
  }

  post(obj: any, blockView = true, contentType?: string): Observable<T> {
    const postMethod = this._http.post<T>(this.url, obj, { headers: this.getHeaders(contentType) });
    return blockView ? this.next(postMethod) : this.noBlockNext(postMethod);
  }

  getHeaders(contentType: string = 'application/json'): HttpHeaders {
    const headers = new HttpHeaders()
      // .set('authorization', `Bearer ${sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''}`)
      .set('Content-Type', contentType);

    return headers;
  }
  // delete(url: string, id: any, blockView = true, contentType?: string): Observable<any> {

  //   const deleteMethod = this._http.delete(`${url}/${id}`, { headers: this.getHeaders(contentType) });

  //   return blockView ? this.next(deleteMethod) : this.noBlockNext(deleteMethod);

  // }

  // patch<T>(url: string, obj: any, blockView = true, contentType?: string): Observable<T> {
  //   const putMethod = this._http.put(url, obj, { headers: this.getHeaders(contentType) });
  //   return blockView ? this.next<T>(putMethod) : this.noBlockNext<T>(putMethod);
  // }


  next(methood: Observable<any>): Observable<T> {
    return Observable.of(1).map(() => this._block.block())
      .mergeMap(() => methood)
      .do(() => this._block.unblock())
      .catch(error => this.handleError(error));
  }

  noBlockNext(methood: any): Observable<T> {
    return methood.catch((error: Response) => this.handleError(error));
  }

  private handleError(error: Response) {
    this._block.unblock();
    const reqObj = error;
    // switch (error.status) {
    //   case 400:
    //   case 401:
    //     reqObj = new BadError(error.json());
    //     break;
    //   case 404:
    //     reqObj = new NotFoundError();
    //     break;
    // }

    this._alc.alert({
      title: '錯誤訊息!!!',
      message: `伺服器發生${error.status}錯誤，請聯絡管理者`,
      type: 'error'
    });
    return Observable.throw(reqObj);
  }
}
