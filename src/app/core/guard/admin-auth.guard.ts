import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { User } from '../model/user.model';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AdminAuthGuard implements CanActivate, CanLoad {
  constructor(
    private _auth: AuthService,
    private _router: Router) { }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    const url = `/${route.path}`;
    return this.isAdmin(url);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAdmin(state.url);
  }


  isAdmin(url: string): Observable<boolean> | Promise<boolean> | boolean {
    return this._auth.currentUser$
      .map((user: User) => {
        if (!user) {
          this._router.navigate(['/no-permissions']);
          return false;
        }
        return true;
      });
  }
}
