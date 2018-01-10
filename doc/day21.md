# [Angular Firebase 入門與實做] Day-21 Firebase Cloud Messaging 推波訊息
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> Put your heart, mind, and soul into even your smallest acts. This is the secret of success. --即便是在微小不過的事情，你也要用心去做，這就是成功的秘密。 (斯瓦米。溪瓦南達)

今天我們透過FCM來實做推波


# Firebase Cloud Messaging
透過他我們可以推波訊息給client端，盡管client並沒有開啟應用，透過services worker來實做依舊能讓使用者收到訊息。

FCM只能在有支持services worker的瀏覽器使用，目前的支援狀況
Chrome: 50+
Firefox: 44+
Opera Mobile: 37+

詳細可以看這裡https://caniuse.com/#search=ServiceWorker

# FCM 環境建立

首先我們要在src底下建立兩個檔案
"manifest.json",
"firebase-messaging-sw.js"

並且將兩個檔案加入`.angular-cli.json` assets中，如此我們才能順利地讀取到資料
```json
"assets": [
  "assets",
  "favicon.ico",
  "manifest.json",
  "firebase-messaging-sw.js"
],
```
接著打開`manifest.json`輸入如下
```json
{
  "short_name": "onfireChat",
  "name": "Chat on firebase with Angular",
  "start_url": "/?utm_source=homescreen",
  "gcm_sender_id": "103953800507"
}
```
其中重要的`gcm_sender_id`不能去修改他，services worker透過他才知道是來自firebase的推波

打開`firebase-messaging-sw.js`輸入如下，時做clinet的firebase
```js
importScripts('https://www.gstatic.com/firebasejs/4.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.6.1/firebase-messaging.js');
firebase.initializeApp({
  'messagingSenderId': 'your key'
});
const messaging = firebase.messaging();
```
其中messagingSenderId是來自我們專案設定裡面的ID，如下圖
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515563782/project_setting_zfq68e.jpg)
將`伺服器金鑰`填入上面的your key中，讓firebase認證你的APP

接著打開`index.html`加入我們的services worker
```html
<head>
  <meta charset="utf-8">
  <title>MyFirebaseFirstApp</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">

  <link rel="manifest" href="/manifest.json">

</head>
```

到這裡環境算是好了，接著時做Angular接收的部分


# Angular FCM 環境建立
接著我們建立一個`cloud-messaging.service.ts`用來統一管理FCM
```js
import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseHttpService } from '@core/service/base-http.service';
import { AuthService } from '@core/service/auth.service';

@Injectable()
export class CloudMessagingService {
  messaging = firebase.messaging();
  currentMessage = new BehaviorSubject(null);
  constructor(private _auth: AuthService, private _http: BaseHttpService) { }

  // 每次APP載入時去取得授權狀態
  getPermission() {
    this.messaging.requestPermission()
      .then(() => {
        console.log('允許授權推波!');
        return this.messaging.getToken();
      })
      .then(token => {
        console.log(token);
        this.updateToken(token);
      })
      .catch((err) => {
        console.log('不給推波', err);
      });
  }
  // 這裡用來更新資料庫的使用者token，我們會透過token來做推波
  updateToken(token) {
    this._auth.fireUser$.take(1).subscribe(user => {
      if (!user) return;
      this._auth.userHandler.document(user.uid)
        .collection('fcmTokens').set(token, { token: token });
    });
  }

  // 可以用來接收訊息
  receiveMessage() {
    this.messaging.onMessage((payload) => {
      console.log('Message received. ', payload);
      this.currentMessage.next(payload);
    });
  }
}
```
筆者將這個service放在core中，因次我們會將它注入在core的providers中，接著我們來到app.component.ts來調用他
```js
export class AppComponent implements OnInit {
  constructor(private _auth: AuthService, private _msg: CloudMessagingService) {
    console.log('App working!');
  }
  ngOnInit() {
    this._msg.getPermission();
  }
}
```
現在我們儲存，如果有正在編譯要記得關掉重新啟動，打開瀏覽器我們會看到以下畫面
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515571380/promission_crlret.jpg)
我們點選接受，接受後在console會看到，我們剛剛寫入的訊息，這代表我們基本的Angular設定完成，接著我們透過trigger來實做推送訊息。

# Functions 推送訊息

我們直接加入在訊息送出後的trigger中，當我們送出訊息後，可以一併送出推波，讓沒有開啟的使用者可以得到推波的訊息，結果如下圖，
筆者在firefox登入了另一個使用者
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515587892/push_mswmjz.gif)

打開 `roomsMessage.firestore.ts`實做如下
```js
export const roomsMessagefirestore = functions.firestore
  .document('/rooms/{roomId}/messages/{messageId}').onCreate((event) => {
    const firestore = admin.firestore();

    const message: MessageModel = event.data.data();
    const senderRef = firestore.doc(`users/${message.sender}`);
    const addresseeRef = firestore.doc(`users/${message.addressee}`);
```
我們再開始加入收信者跟送信者的Ref後面好用他們做操作
我們這裡直接使用Ref做操作了~
```js
return Promise.all([
  senderRef
    .collection('rooms')
    .doc(message.addressee)
    .update(storeTimeObject({ last: message }, false)),
  addresseeRef
    .collection('rooms')
    .doc(message.sender)
    .update(storeTimeObject({ last: message }, false)),
  fileHandler
])
```
接著在他的後面我們送出推波，先取得送者跟收者的資料
```js
  .then(() => {
    return Promise.all([
      addresseeRef.get(),
      senderRef.get()
    ]);
  })
```

接著我們可以使用typescript的寫法，直接給予一個陣列指定收者跟送者，要注意順序不要錯了
```js
  .then(async ([address, sender]) => {
    // 這裡使用async await的寫法
    const addresseeTokens = await address.ref.collection('fcmTokens').get();

    if (addresseeTokens.empty) {
      // 這個人尚未有任何載具
      return false;
    }

    const addresseeData = address.data();
    const senderData = sender.data();

    const payload = {
      notification: {
        title: addresseeData.displayName,
        icon: senderData.photoURL,
        body: message.content,
      }
    };

    const messaging = admin.messaging();

    // 最後根據使用者所有的載續的token送出推波
    return addresseeTokens.docs.map(token => {
      return messaging.sendToDevice(token.data().token, payload);
    });
  })
});
```

接著我們deploy上去，打開瀏覽器測試看看，就能成功的推波了~

# 本日小節
今天我們透過FCM成功時做了推波功能，真的是非常的好用！也了解到web越來越強大了，關於services worker的使用方法，還有很多，讀者們可以蒐尋找找資料，真的是非常的powerful!有了推波之後我們的聊天室真的越來越有模有樣了！

# 本日原始碼
|名稱|網址|
|---|---|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day21_cloud_messaging|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day21_cloud_messaging|


# 參考文章
https://firebase.google.com/docs/cloud-messaging/js/client?authuser=1
https://www.youtube.com/watch?v=z27IroVNFLI&t=195s
https://angularfirebase.com/lessons/send-push-notifications-in-angular-with-firebase-cloud-messaging/
