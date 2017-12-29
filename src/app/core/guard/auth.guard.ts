import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot } from '@angular/router';
import { CanLoad } from '@angular/router/src/interfaces';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../service/auth.service';
import { environment } from '@env';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private _auth: AuthService,
    private _router: Router) { }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    // console.log('AuthGuard canLoad');
    const url = `/${route.path}`;
    return this.isLogin(url);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // console.log('AuthGuard canActivate');
    return this.isLogin(state.url);
  }

  private isLogin(url: string): Observable<boolean> | Promise<boolean> | boolean {
    // https://github.com/angular/angular/issues/18991
    return this._auth.fireUser$
      .take(1)
      .map((user) => {
        if (user) return true;

        this._router.navigate(environment.nonAuthenticationUrl, { queryParams: { returnUrl: url } });
        return false;
      });
  }
}
