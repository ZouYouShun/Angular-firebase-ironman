import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';

import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { onlyOnBrowser } from '@shared/decorator/only-on.browser';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { UserModel, USER_TYPE } from '../model/user.model';
import { BaseHttpService, CollectionHandler } from './base-http.service';
import { environment } from '@env';
import { BlockViewService } from '@core/service/block-view.service';
import { AlertConfirmService, AlertConfirmModel } from '@core/component/alert-confirm';

@Injectable()
export class AuthService {

  fireUser$: Observable<firebase.User>;

  user: UserModel;
  currentUser$ = new BehaviorSubject<UserModel>(null);
  userHandler: CollectionHandler<UserModel>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _afAuth: AngularFireAuth,
    private _http: BaseHttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _block: BlockViewService,
    private _alc: AlertConfirmService
  ) {
    this.userHandler = this._http.collection<UserModel>(`users`);

    // 用來保存當前angularfire的使用者狀態
    this.fireUser$ = this._afAuth.authState;
    // 由於這個Service會永遠存活，我們不需對他做unsubscribe
    // this._afAuth.authState
    //   // .do(() => this._block.block('登入中'))
    //   .switchMap(user => {
    //     return this.updateUser(user);
    //   })
    //   .switchMap(key => this.userHandler.document<UserModel>(key).get())
    //   .subscribe(user => {
    //     // user.ref.collection('rooms').get().then((x) => console.dir(x));
    //     // console.log(user);
    //     this._block.unblock();
    //     this.returnUrl(user);
    //     this.user = user;
    //     this.currentUser$.next(user);
    //   });
  }


  // 注意！當註冊後也會更改當前authState，也會接到user，視同於登入
  signUpByEmail(obj: { email: string, password: string, name: string }) {
    if (obj.name) {
      return Observable.fromPromise(this._afAuth.auth.createUserWithEmailAndPassword(obj.email, obj.password))
        .switchMap(result => {
          const user = Object.assign({}, result, { displayName: obj.name });
          return this.addUser(user, USER_TYPE.EMAIL);
        })
        .do(() => {
          this.signOut();
          this._router.navigateByUrl('/auth/signin');
        })
        .catch(err => this.ErrorHandler(err));
    }
    this._alc.alert(new AlertConfirmModel('註冊失敗', '未輸入名子', 'warning'));
    return Observable.of(null);
  }

  signInUpByGoogle(isSignUp = false) {
    return this.signInUpBySocialMedia(new firebase.auth.GoogleAuthProvider(), 'google', isSignUp);
  }

  signInUpByFacebook(isSignUp = false) {
    return this.signInUpBySocialMedia(new firebase.auth.FacebookAuthProvider(), 'facebook', isSignUp);
  }

  signInByEmail(email: string, password: string) {
    this.storeUrl();
    return Observable.fromPromise(
      this._afAuth.auth.signInWithEmailAndPassword(email, password)
        .catch(err => this.ErrorHandler(err))
    );
  }

  private signInUpBySocialMedia(provider, type, isSignUp = false) {
    this.storeUrl();

    return Observable.fromPromise(this._afAuth.auth.signInWithPopup(provider))
      // .switchMap(result => {
      //   const user = result.user;
      //   return this.addUser(user, type);
      // })
      .catch(err => this.ErrorHandler(err, isSignUp ? '註冊失敗' : '登入失敗'));
  }

  @onlyOnBrowser('platformId')
  private storeUrl() {
    const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || '/';
    localStorage.setItem('returnUrl', returnUrl);
  }

  @onlyOnBrowser('platformId')
  private returnUrl(user: UserModel) {
    if (user) {
      const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || localStorage.getItem('returnUrl');
      if (returnUrl) {
        this._router.navigateByUrl(returnUrl);
        localStorage.removeItem('returnUrl');
      }
    }
  }
  // Sends email allowing user to reset password
  resetPassword(oldPassword: string, newPassword: string) {
    // 修改前要再次登入一次
    this.signInByEmail(this._afAuth.auth.currentUser.email, oldPassword)
      .switchMap(() => Observable.fromPromise(this._afAuth.auth.currentUser.updatePassword(newPassword)));
  }

  signOut() {
    return Observable.fromPromise(this._afAuth.auth.signOut())
      .do(() => this._router.navigate(environment.nonAuthenticationUrl));
  }

  private updateUser(user: firebase.User) {
    if (user) {
      const data: UserModel = {
        email: user.email,
        photoURL: user.photoURL,
        lastSignInTime: user.metadata.lastSignInTime
      };
      return this.userHandler.update(user.uid, data);
    }
    return Observable.of(null);
  }

  private addUser(user: firebase.User, types: USER_TYPE) {
    const data: UserModel = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastSignInTime: user.metadata.lastSignInTime,
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
    return Observable.of(`Error: ${err}`);
  }
}
