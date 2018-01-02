import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor() { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(
      req.clone({
        url: `${environment.serverUrl}/${req.url}`
      }));
  }
}
