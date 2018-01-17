import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { onlyOnBrowser } from '@shared/decorator/only-on.browser';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { UserModel, USER_TYPE } from '../model/user.model';
import { BaseHttpService, CollectionHandler, DocumentHandler } from './base-http.service';
import { environment } from '@env';
import { BlockViewService } from '@core/service/block-view.service';
import { AlertConfirmService, AlertConfirmModel } from '@core/component/alert-confirm';
import { CloudMessagingService } from './cloud-messaging.service';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { tap, mergeMap, catchError, switchMap, filter, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Injectable()
export class AuthService {

  fireUser$: Observable<firebase.User>;

  user: UserModel;
  currentUser$ = new BehaviorSubject<UserModel>(null);
  userHandler: CollectionHandler<UserModel>;
  currentUserHandler: DocumentHandler<UserModel>;

  private disconnect: firebase.database.OnDisconnect;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _afAuth: AngularFireAuth,
    private _http: BaseHttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _block: BlockViewService,
    private _alc: AlertConfirmService,
    private _cms: CloudMessagingService
  ) {
    this.userHandler = this._http.collection<UserModel>(`users`);

    // 用來保存當前angularfire的使用者狀態
    this.fireUser$ = this._afAuth.authState;
    // 由於這個Service會永遠存活，我們不需對他做unsubscribe
    this.fireUser$.pipe(
      tap(() => this._block.block('登入中')),
      // switchMap(user => {
      //   return this.updateUser(user);
      // }),
      switchMap(user => {
        if (user) {
          this.currentUserHandler = this.userHandler.document<UserModel>(user.uid);
          return this.currentUserHandler.get();
        }
        return of(null);
      }),
      tap(user => {
        this._block.unblock();
        this.user = user;
        this.currentUser$.next(user);
      }),
      filter(u => !!u),
      switchMap(user => {
        this.returnUrl(user);
        return this._cms.getPermission(this.currentUserHandler);
      })
    ).subscribe();
  }


  // 注意！當註冊後也會更改當前authState，也會接到user，視同於登入
  signUpByEmail(obj: { email: string, password: string, name: string }) {
    if (obj.name) {
      return fromPromise(this._afAuth.auth.createUserWithEmailAndPassword(obj.email, obj.password))
        .switchMap(result => {
          const user = Object.assign({}, result, { displayName: obj.name });
          return this.addUser(user, USER_TYPE.EMAIL);
        }).pipe(
        tap(() => {
          this.signOut();
          this._router.navigateByUrl('/auth/signin');
        }),
        catchError(err => this.ErrorHandler(err))
        );
    }
    this._alc.alert(new AlertConfirmModel('註冊失敗', '未輸入名子', 'warning'));
    return of(null);
  }

  signInUpByGoogle(isSignUp = false) {
    return this.signInUpBySocialMedia(new firebase.auth.GoogleAuthProvider(), 'google', isSignUp);
  }

  signInUpByFacebook(isSignUp = false) {
    return this.signInUpBySocialMedia(new firebase.auth.FacebookAuthProvider(), 'facebook', isSignUp);
  }

  signInByEmail(email: string, password: string) {
    this.storeUrl();
    return fromPromise(
      this._afAuth.auth.signInWithEmailAndPassword(email, password)
        .catch(err => this.ErrorHandler(err))
    );
  }

  private signInUpBySocialMedia(provider, type, isSignUp = false) {
    this.storeUrl();

    return fromPromise(
      this._afAuth.auth.signInWithPopup(provider)
        .catch(err => this.ErrorHandler(err, isSignUp ? '註冊失敗' : '登入失敗'))
    );
  }

  @onlyOnBrowser('platformId')
  private storeUrl() {
    const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || '/';
    localStorage.setItem('returnUrl', returnUrl);
  }

  @onlyOnBrowser('platformId')
  private returnUrl(user: UserModel) {
    const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || localStorage.getItem('returnUrl');
    if (returnUrl) {
      this._router.navigateByUrl(returnUrl);
      localStorage.removeItem('returnUrl');
    }
  }
  // Sends email allowing user to reset password
  resetPassword(oldPassword: string, newPassword: string) {
    // 修改前要再次登入一次
    this.signInByEmail(this._afAuth.auth.currentUser.email, oldPassword).pipe(
      switchMap(() => fromPromise(this._afAuth.auth.currentUser.updatePassword(newPassword)))
    );
  }

  signOut() {
    return this.currentUserHandler.update(<any>{
      loginStatus: false,
      lastSignInTime: firebase.firestore.FieldValue.serverTimestamp()
    }, false).pipe(
      mergeMap(() => this._cms.deleteToken()),
      tap(() => {
        this._router.navigate(environment.nonAuthenticationUrl);
        this._afAuth.auth.signOut();
      })
      );
  }

  // private updateUser(user: firebase.User) {
  //   if (user) {
  //     const data: UserModel = {
  //       email: user.email,
  //       photoURL: user.photoURL,
  //       lastSignInTime: user.metadata.lastSignInTime
  //     };
  //     return this.userHandler.update(user.uid, data);
  //   }
  //   return of(null);
  // }

  private addUser(user: firebase.User, types: USER_TYPE) {
    const data: UserModel = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      type: types
    };
    return this.userHandler.set(data.uid, data);
  }

  private ErrorHandler(err: firebase.auth.Error, title = '登入失敗') {
    console.log(err);
    let message = '系統錯誤，請聯絡管理人員';
    switch (err.code) {
      case 'auth/account-exists-with-different-credential':
      case 'auth/email-already-in-use':
        message = '帳號已存在';
        break;
      case 'auth/invalid-email':
        message = '無效的帳號';
        break;
      case 'auth/wrong-password':
        message = '密碼錯誤';
        break;
      case 'auth/weak-password':
        message = '密碼格式錯誤';
        break;
      case 'auth/popup-closed-by-user':
        message = '';
        break;
      default:
        break;
    }
    console.log(message);
    if (message) {
      this._alc.alert(new AlertConfirmModel(title, message, 'warning'));
    }
    return of(`Error: ${err}`);
  }
}
