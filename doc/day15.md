# [Angular Firebase 入門與實做] Day-15 Cloud Functions HTTP Triggers 02

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> As I began to love myself, I found that anguish and emotional suffering are only warning signs that I was living against my own truth. Today I know, this is "AUTHENTICITY".

> 當我真正開始愛自己，我才認識到，所有的痛苦和感情的折磨，都只是在提醒我：我的生活違背了自己的本心。今天我明白了，這叫做"真實"。--卓別林《當我開始愛自己》


昨天我們介紹了triggers今天我們使用http來包裝方法藉此來減少我們在前端的程式碼，

我們今天針對[day13](https://ithelp.ithome.com.tw/articles/10195548)下面這段rx操作，把操作移到functions
```js
req = this.roomsHandler.add(<any>{}).switchMap(room => {
  // 我們這邊會使用forkJoin把所有的observable合併成一個observable
  return Observable.forkJoin([
    // 寫訊息
    room.collection('messages').add({
      uid: this.sender.uid,
      content: content
    }),
    // 寫房間的使用者
    room.collection('users').set(this.sender.uid, {}),
    room.collection('users').set(this.addressee.uid, {}),
    // 寫使用者的房間對應的ID
    this._http.document(`users/${this.sender.uid}`).collection('rooms').set(this.addressee.uid, { roomId: room.id }),
    this._http.document(`users/${this.addressee.uid}`).collection('rooms').set(this.sender.uid, { roomId: room.id })
  ]);
});
```

我們的目表是只使用一個http來取代所有rx的操作，下面我們使用express的route來做包裝，並實作http

# Http Trigger 搭配使用express 實做
我們建立一個messageApi實做如下
```js
import { Router } from 'express';
import { storeTimeObject } from '../libs/timestamp';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const messageApi = Router()
  .post('/roomWithMessage', async (req, res, next) => {
    try {
      const firestore = admin.firestore();
      // user ref
      const usersRef = firestore.collection('users');
      // add room 這裡使用es6 的await，因為我們使用的是typescript且firebase的nodejs也有支援，我們可以開心的使用他
      const room = await firestore.collection('rooms').add(storeTimeObject({}));
      const messageData = req.body.message;

      const roomsUsers = room.collection('users');
      const messagesRef = room.collection('messages');

      // 這裡使用Promise.all把所有的promise組裝再一起一併發送出去
      return Promise.all([
        // add message
        messagesRef
          .add(storeTimeObject(messageData)),
        // set rooms user => sender
        roomsUsers
          .doc(messageData.sender)
          .set(storeTimeObject({})),
        // set rooms user => addressee
        roomsUsers
          .doc(messageData.addressee)
          .set(storeTimeObject({})),
        // set sender room
        usersRef
          .doc(messageData.sender)
          .collection('rooms')
          .doc(messageData.addressee)
          .set(storeTimeObject({ roomId: room.id })),
        // set addressee room
        usersRef
          .doc(messageData.addressee)
          .collection('rooms')
          .doc(messageData.sender)
          .set(storeTimeObject({ roomId: room.id }))
      ]).then((result) => {
        //注意這裡一定要回傳res，不然方法不會結束
        return res.success({
          message: 'add message success',
          obj: result
        });
      });
    } catch (error) {
      //注意這裡一定要回傳res，不然方法不會結束
      return res.status(500).json({
        message: 'fail',
        obj: error
      });
    }
  });
```
相關admin的API，大家可以直接看Types來了解如何撰寫程式，或是[官方文件](https://firebase.google.com/docs/reference/functions/?authuser=0)
要對資料庫做修改我們都會使用admin來做操作，要注意必須在index.ts認證並初始化App。

## 在index.ts認證並初始化App
```js
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);
```
接著我們回到`api.route.ts`把剛剛建立的messageApi加上去
```js
export const apiRouter = express.Router()
    .use('/message', messageApi) // 我們建立一個messageApi
```

# Angular應用修改

因為我們要使用HttpClient去post方法，我們也可以將http使用先前的包裝方式包裝起來，

## 使用 BaseHttpService包裝http request

我們回到base.http.service中
加入以下方法
```js
  constructor(
    private _afs: AngularFirestore,
    private _db: AngularFireDatabase,
    private _http: HttpClient,
    private _block: BlockViewService, // 這是筆者block，用來遮罩進度
    private _alc: AlertConfirmService, // 這是筆者的alertConfirm，用來跳錯誤及提示
    @Inject(PLATFORM_ID) private platformId: Object) { } // 這是SSR需要使用到的platformId

  // 我們使用request將其包裝起來
  request<T>(url: string) {
    return new MyHttpHandler(this._http, url, this._block, this._alc, this.platformId);
  }
```

### MyHttpHandler
```js
export interface MyHttpConfig {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

export class MyHttpHandler<T> {
  url: string;
  constructor(
    private _http: HttpClient,
    _url,
    private _block: BlockViewService,
    private _alc: AlertConfirmService,
    private platformId: Object) {
    this.url = _url;
  }

  post(obj: any, blockView = true, contentType?: string): Observable<T> {
    const postMethod = this._http.post<T>(this.url, obj, { headers: this.getHeaders(contentType) });
    return blockView ? this.next(postMethod) : this.noBlockNext(postMethod);
  }

  getHeaders(contentType: string = 'application/json'): HttpHeaders {
    const headers = new HttpHeaders()
      .set('Content-Type', contentType);

    return headers;
  }
  
  next(methood: Observable<any>): Observable<T> {
    return Observable.of(1).map(() => this._block.block())
      .mergeMap(() => methood)
      .do(() => this._block.unblock())
      .catch(error => this.handleError(error));
  }

  noBlockNext(methood: any): Observable<T> {
    return methood.catch((error: Response) => this.handleError(error));
  }
  
  private handleError(error: Response) {
    this._block.unblock();
    const reqObj = error;

    this._alc.alert({
      title: '錯誤訊息!!!',
      message: `伺服器發生${error.status}錯誤，請聯絡管理者`,
      type: 'error'
    });
    return Observable.throw(reqObj);
  }
}
```
這是筆者習慣的實作方式，大家可以依據自己習慣的方式做包裝使用。

### 修改message-detial

我們把message-detial裡面剛剛那一段直接修改成下面這樣，變成一個post方法
```js
req = this._http.request('/api/message/roomWithMessage').post({
  message: {
    sender: this.sender.uid,
    addressee: this.addressee.uid,
    content: content
  }
});
```
接著我們回到APP中做測試，我們會發現我們的post成功了，且資料也正確的透過Realtime的方式回到前端來，我們的code是不是乾淨了許多呢？

# 本日原始碼
|名稱|網址|
|---|---|
|Angular|https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day15_implements|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day15_implements|

# 成果
https://onfirechat.ga/message

帳號：test@gmail.com
密碼：aa1234

帳號：test2@gmail.com
密碼：aa1234

# 本日小節
今天我們使用http改善我們在app中做的很多的post來回，並且使用base-http包裝request的post方法，有了http我們就像在call 一般的後端一樣，在後端做處理，並透過realtime的方式將資料做更新，並且我們實做了block的功能，讓使用者知道當前的狀況。


# 參考文章
https://firebase.google.com/docs/functions/http-events?authuser=0
https://firebase.google.com/docs/reference/functions/?authuser=0
