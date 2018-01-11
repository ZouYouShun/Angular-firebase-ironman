# [Angular Firebase 入門與實做] Day-22 Firebase Cloud Messaging 推波訊息 02 登入登出token實做
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> There is no doubt that good things will come, and when it comes later, it will be a surprise. -- 無庸置疑，好事情總會到來。而當他來晚時，也不失是一種驚喜。

昨天我們知道了基本的推波方法，我們今天進一步修正登入登出的使用者token存取，不要造成不必要的推波。

我們整理一下昨天的邏輯，以及問題
1. 當使用者登入後，我們會記錄token，並且送回資料庫  -- 我們做到了
2. 當使用者登出，我們要把token從站台移除。  --接下來實做
3. 當使用者透過把token手動清除時，我們要想辦法從資料庫移除該筆無效的token。 --我們要想一個辦法識別該設備

關於第三點，我們要怎麼識別呢？
筆者參考了先前我們在使用Gmail寄信時的紀錄方法
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515650874/device_xhpax9.jpg)
這是筆者的Gmail登入的狀況，我們可以發現，在google他們記錄了我們的登入裝置，我們可以透過取得登入裝置來決定要刪除的token內容。

我們可以注意到google記錄了什麼，他記錄了裝置名稱、裝置地點、最後的使用時間

* 裝置名稱  我們可以簡單透過`navigator.userAgent`取得
* 裝置地點  我們需要要求使用者提供位置資訊，且並不是每個人都會同意，我們這裡不使用
* 最後使用時間 這個我們已經有做紀錄了

接著我們開始實做

先修改`cloud-messaging-service.ts`
```js
  constructor(
    private _http: BaseHttpService,
    @Inject(PLATFORM_ID) private platformId: Object) { }

  // 這個方法在ssr執行沒有任何意義，我們直接把它忽略掉
  @onlyOnBrowser('platformId')
  getPermission(user: DocumentHandler<UserModel>) {
    return Observable.fromPromise(
      this.messaging.requestPermission()
        .then(() => {
          console.log('允許授權推波!');
          return this.messaging.getToken();
        }))
      .switchMap(token => {
        console.log(token);
        this.token = token;
        return this.saveTokenLocal(token, user.collection('fcmTokens'));
      })
      .switchMap(() => {
        console.log('set');
        this.fcmTockenHandler = user.collection('fcmTokens').document(this.token);
        return this.fcmTockenHandler.set({
          token: this.token,
          userAgent: navigator.userAgent
        });
      })
      .catch((err) => {
        console.log('不給推波', err);
        return Observable.throw(new Error('不給推波'));
      });
  }
```
我們整體都使用Rx做包裝，以便我們管理時間順序，實作
1. 取得token
2. 把token存在localStorage並且判斷現在的storage與先前存的有何差別，作相對營的行為
3. 接著我們當上面做完了，我們執行新的token寫到資料庫，更新當前的這筆資料
4. 若失敗了，我們throw一個錯誤出去

接著時做`saveTokenLocal`的方法
```js
saveTokenLocal(token, tokensRef: CollectionHandler<{}>) {
  const localToken = localStorage.getItem(tokenName);
  const userAgent = navigator.userAgent;

  localStorage.setItem(tokenName, token);
  // if is empty, it maybe first time or manual delete
  if (!localToken) {
    // 取得這個人所有的token，把所有userAgent相同的刪除
    console.log('!');
    return tokensRef.get({ isKey: true, queryFn: ref => ref.where('userAgent', '==', userAgent) })
      .take(1)
      .map((tokens: any[]) => tokens.filter(obj => obj.id !== token) // 排除掉當前的token
        .map((i: any) => tokensRef.delete(i.id))
      );
  } else if (localToken !== token) {
    // 很少會發生這樣的情況，這個情況發生在使用者手動移除權限，但是沒有移除local storage
    return tokensRef.delete(localToken);
  }
  // 若都沒發生就丟一個null出去
  return Observable.of(null);
}
```
如此一來當使用者登入後我們的資料庫就不會有多餘的token了，但是這個方法有個缺陷，如果使用者用了兩台相同的裝置進行登入，那userAgent會取得相同的結果，會導致前一台的推波被蓋掉，因為太少會有這類狀況，這邊不考慮。

接著我們實作登出時把token清除，一樣不再ssr時執行
```js
@onlyOnBrowser('platformId')
deleteToken() {
  return this.fcmTockenHandler.delete()
    .do(() => localStorage.removeItem(tokenName))
    .mergeMap(() => Observable.fromPromise(this.messaging.deleteToken(this.token)));
}
```
1. 先把storage清掉
2. 清除資料庫的token

接著我們到auth.services修改一下
```js
this.fireUser$
  .do(() => this._block.block('登入中'))
  .switchMap(user => {
    return this.updateUser(user);
  })
  .switchMap(key => {
    this.currentUserHandler = this.userHandler.document<UserModel>(key);
    return this.currentUserHandler.get();
  })
  .do(user => {
    this._block.unblock();
    this.user = user;
    this.currentUser$.next(user);
  })
  // 這邊當我們取得使用者時，去導頁，並且要求權限
  .filter(u => !!u)
  .switchMap(user => {
    this.returnUrl(user);
    return this._cms.getPermission(this.currentUserHandler);
  })
  .subscribe();
```

登出部分
```js
signOut() {
  return Observable.fromPromise(this._afAuth.auth.signOut())
    .do(() => this._router.navigate(environment.nonAuthenticationUrl))
    .mergeMap(() => this._cms.deleteToken());
}
```
登出後導頁，並且同時清除token

如此就修正完畢，我們不會存有多餘的token在伺服器導致有多餘的推波了。


我們可以手動關閉授權，從新取得試試看，可以在這裡關閉
[chrome://settings/content/notifications](chrome://settings/content/notifications)
把自己的網域移除掉即可。


# 本日小節
今天我們修正了多餘的token的問題，避免有很多不必要的推波的浪費，但是我們實際上還是會需要手動清除的狀況，筆者建議大家要給使用者一個管理裝置的功能，一來可以讓使用者知道有哪些裝置是有登入過的，且尚未登出，二來是可以讓使用這手動管理登入的狀況、推波的情形，甚至透過realtime的特性，我們也可以讓使用者把其他裝置登出的功能(沒有重新整理的狀態下)。

今天筆者把專案升級到5.2了，有使用的夥伴要注意~

# 本日原始碼
|名稱|網址|
|---|---|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day22_cloud_messaging_2|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day22_cloud_messaging_2|
