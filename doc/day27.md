# [Angular Firebase 入門與實做] Day-27 [實做] 使用者登入狀態
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> The only limit to our realization of tomorrow will be our doubts of today. --實現明天理想的唯一障礙是今天的疑慮。(FranklinD. Roosevelt)

# 今天目標
今天我們來實做登入中的功能，透過realtime database的特性來達到即時的登入狀態，並透過trigger來將資料一併更新到firestore。

## 使用Realtime database達到監聽登入登出的功能
透過realtime Database提供的特別物件`'.info/connected'`來操作

建立一個`LoginStatusService`來統一管理，
實作如下
* LoginStatusService
```js
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@core/service/base-http.service';
import { map, tap, filter, combineLatest } from 'rxjs/operators';
import * as firebase from 'firebase';
import { AuthService } from './auth.service';
import { isOnlineForDatabase, isOfflineForDatabase } from '../model/login.model';
import { dbTimeObject } from '@core/service/base-http.service/model/realtime-database/db.time.function';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class LoginStatusService {

  // 使用一個變數來存當下的離線事件，當離線時要移除
  private _disconnection: firebase.database.OnDisconnect;

  constructor(private _http: BaseHttpService, private _auth: AuthService) {

    // 由於我們這個Observable永遠不會結束，我們一樣直接在內部subscribe即可
    this._auth.currentUser$.pipe(
      combineLatest(this._http.object('.info/connected').get()),
      tap(([user, connected]) => {
        console.log(user);
        if (user) {
          const userStatusDatabaseRef = firebase.database().ref('/status/' + user.uid);
          // 這裡我們直接使用先前實作的dbTimeObject來建立時間
          userStatusDatabaseRef.set(dbTimeObject({ state: true }, false));

          this._disconnection = userStatusDatabaseRef.onDisconnect();
          this._disconnection.set(dbTimeObject({ state: false }, false));
        } else {
          if (this._disconnection) {
            console.log('取消');
            this._disconnection.cancel();
          }
        }
      })
    ).subscribe();
  }
}
```
這邊我們直接使用firebase js實做，因為在angularfire2並未包裝，注意當我們離線的時候記得把事件取消，不然關閉瀏覽器時，會多送離線事件出去。

接著我們在使用者*手動登出*的時候也要做處理，把資料庫的狀態做修改，這裡我們使用我們包裝好的document直接做處理即可，
因為我們最後是想要使用firestore來顯示登入狀態，我們就不必修改realtime的資料了，那只是為了透過realtime database的特行來觸發我們的trigger，把資料寫入firestore，當然你要使用realtime database再次啟用狀態也是可以的。
* AuthService
```js
signOut() {
  return this._http.document(`status/${this.user.uid}`).set({ state: false }, false).pipe(
    mergeMap(() => this._cms.deleteToken()),
    tap(() => {
      this._router.navigate(environment.nonAuthenticationUrl);
      this._afAuth.auth.signOut();
    })
  );
}
```

最後我們透過trigger來更新firestore
```js
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const userStatusFirestore = functions.database
  .ref('/status/{uid}').onUpdate(event => {
    const firestore = admin.firestore();
    const eventStatus = event.data.val();

    const userStatusFirestoreRef = firestore.doc(`status/${event.params.uid}`);

    // 資料可能快速的被做修改，如果我們發現時間事件時間小於資料庫的更新時間，不做處理
    return event.data.ref.once("value").then((statusSnapshot) => {
      return statusSnapshot.val();
    }).then((status) => {
      if (status.updatedAt > eventStatus.updatedAt) return null;

      // 把資料轉乘時間格式
      eventStatus.updatedAt = new Date(eventStatus.updatedAt);
      return userStatusFirestoreRef.set(eventStatus);
    });
  });
```
這裡因為我們的資料可能快速的被修改，而trigger的速度會慢一些，為了避免多餘的複寫，我們重新讀取一次資料，若發現時間較晚，不執行任何事情，會有*下一個任務*來負責複寫的行為。

完成!

# 本日小節
透過'.info/connected'來得知當前的連線狀態，並且當使用者段開的時候直接透過先前設定好的方法回傳，最後再透過Trigger來將資料存到store，可說是很優雅，也是realtime真正的強大之處。

注意筆者今天把所有rxjs升級到pipeable operator了，可能會有夥伴不習慣，不過其實大同小異，筆者很建議大家升級，這關西到最後檔案的大小、整體開發時的穩定性，不再使用rxjs/add的方式來加上方法了，詳細可以看這裡：
https://github.com/ReactiveX/rxjs/blob/master/doc/pipeable-operators.md

所有方法都包裝在pipe裡面，另外有幾個比較常用的operator也改了
1. `do` -> `tap`
2. `catch` -> `catchError`
3. `switch` -> `switchAll`
4. `finally` -> `finalize`

大家使用上要注意，另外還有Observable的修改，都是直接使用function開頭了，不會再使用Observable.()的方式
以下舉例：
`Observable.throw(new Error('no key!'))` -> `ErrorObservable.create(new Error('no key!'));`
`Observable.of(1)` -> `of(1)`
大家要注意，筆者今天寫下來的感覺是變得蠻乾淨的，但是要熟悉一下，另外就是自定義跟封裝變得更簡單了，因為都是一個一個function，最重要的是檔案大小!!!!會被搖掉了~~~~大家可以看這篇比較文：
https://hackernoon.com/rxjs-reduce-bundle-size-using-lettable-operators-418307295e85
強烈建議大家要更新，我想官方也是迫於無奈才改了，不然原本使用.的方式來撰寫真的是很不錯了。


# 本日原始碼
|名稱|網址|
|---|---|
|Angular| https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day27_login_status|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day27_login_status|


# 參考資料
https://firebase.google.com/docs/reference/android/com/google/firebase/database/OnDisconnect
https://github.com/firebase/functions-samples/blob/master/presence-firestore/README.md
