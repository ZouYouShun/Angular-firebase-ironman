import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../service/auth.service';
import { CanLoad } from '@angular/router/src/interfaces';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private _auth: AuthService,
    private _router: Router) { }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    console.log('AuthGuard canLoad');
    const url = `/${route.path}`;
    return this.isLogin(url);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log('AuthGuard canActivate');
    return this.isLogin(state.url);
  }

  private isLogin(url: string): Observable<boolean> | Promise<boolean> | boolean {
    return this._auth.fireUser$.map((user) => {
      if (user) return true;

      this._router.navigate(['/', 'auth', 'signin'], { queryParams: { returnUrl: url } });
      return false;
    });
  }
}
