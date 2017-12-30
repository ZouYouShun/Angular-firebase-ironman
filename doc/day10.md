# [Angular Firebase 入門與實做] Day-08 Authentication - 02 路由守衛

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> You can't reach for anything new, if your hands are still full of yesterdays junk.
	
今日範例：https://onfirechat.ga/message
進去後會要求登入，登入後才能進入訊息介面(訊息頁面尚未實做完成，直接點左上回首頁即可，只是為了測試Guard)。

今天我們來實做route的守衛，也就是Guard，這是Angular讓我們對route提供路由時的保護，防止未認證的使用者進到不該進去的頁面。

因為這是跟auth相關的，我們一樣放在core module之中，建立一個guard的資料夾，並使用cli建立一個guard
`ng g guard auth`

實做如下
auth.guard.ts
```js
import 'rxjs/add/operator/take';
...

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private _auth: AuthService,
    private _router: Router) { }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    const url = `/${route.path}`;
    return this.isLogin(url);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
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
```
我們implements CanActivate, CanLoad，這兩個方法我們較常使用，先建立兩個方法，未來可以在實做其他Guard。

> 注意的是一定要記得使用`take(1)`包裝，因為在canLoad的部分，目前如果是不會complete的方法，他會直接回傳false，導致我們實作上不正常，詳細可以看此篇[issue](https://github.com/angular/angular/issues/18991)

為了讓我們導頁登入後能再次回到原畫面，我們船一個queryParams過去，筆者定義為`returnUrl`，而要導過去的頁面筆者會在environment建立一筆nonAuthenticationUrl，讓我們未來如果想要導頁至其他地方時，可以只改一個地方。
```json
{
  production: true,
  nonAuthenticationUrl: ['/', 'auth', 'signin']
  ...
};
```

接著我們回到auth.service，在昨天取得使用者的地方加上一個方法`this.returnUrl(user);`並實做該方法

```js
@Injectable()
export class AuthService {
  currentUser = new BehaviorSubject<User>(null);
  userHandler: CollectionHandler<User>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _afAuth: AngularFireAuth,
    private _http: BaseHttpService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
    this.userHandler = this._http.collection<User>(`users`);

    this._afAuth.authState
      .switchMap(user => this.updateUser(user))
      .switchMap(key => this.userHandler.getById(key))
      .subscribe(user => { 
        // 有人登入後就導頁
        this.returnUrl(user);
        this.currentUser.next(user); 
      });
  }
  ...
  
  signInUpByGoogle() {
    this.storeUrl(); // 在導頁前先存下來
    ...
  }
  ... 

  @onlyOnBrowser('platformId')
  private storeUrl() {
    const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || '/';
    localStorage.setItem('returnUrl', returnUrl);
  }

  @onlyOnBrowser('platformId')
  private returnUrl(user: User) {
    if (user) {
      const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || localStorage.getItem('returnUrl');
      if (returnUrl) {
        this._router.navigateByUrl(returnUrl);
        localStorage.removeItem('returnUrl');
      }
    }
  }
  ....
}
```
解釋：
1. 我們在每種登入前，去把當前的網址參數存下來
2. 我們先使用queryParamMap的網址，若沒有串則使用localStorage(如果使用導頁，參數會不見)
3. 最後再登入的時候，authState改變我們就能做到導頁的功能了
4. 你可能會疑惑onlyOnBrowser('platformId')是做什麼的，這是為了將來SSR的實作，因為localstorage並不存在伺服器端，我們會用這個自己建立的decorator包起來，防止在伺服器端有錯誤。

onlyOnBrowser.ts
```js
import { isPlatformBrowser } from '@angular/common';
export function onlyOnBrowser(variableId) {
  return function (target, key, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
      if (isPlatformBrowser(this[variableId])) {
        originalMethod.apply(this, args);
      }
    };
    return descriptor;
  };
}
```
 這是decorator的方式，所以在decorator並沒有*this*這東西，我們使用船字串的方式來實做，必須注意一點的是，這裡的參數必須跟上方constructor中`@Inject(PLATFORM_ID) private platformId: Object`內部的參數名稱相同，這是筆者自己想的方法，不曉得有無更好的實作方法，有請大大們糾正！

最後我們在任何想防護的route加上`canActivate: [AuthGuard]`或是`canLoad: [AuthGuard]`他就能針對回傳的結果來決定是否能進去該route了！
 
本日範例：https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day9_authentication_guard

# 本日小節
今天未route加上了保護，我們可以針對未認證的使用者作防禦，避免使用者在未認證的狀況進到系統中，並且我們時做了onlyOnBrowser方法，來進一步實做並讓系統能在SSR的狀況下運作，相關SSR的部份我們未來還會做講解。

# 參考文章
https://github.com/angular/angular/issues/18991
