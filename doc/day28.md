# [Angular Firebase 入門與實做] Day-28 [實做] 使用者已讀狀態 01 Batch 批次寫入
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> And those who were seen dancing were thought to be insane by those who could not hear the music. -- 那些聽不見音樂的人認為那些跳舞的人瘋了。 (尼采)

# 今天目標
今天我們要透過realtime DB的特性知道有多少人已讀，並且透過Batch批次寫入已讀人員。

#### 訊息送出已讀人員寫入
在開始前我們來思考一下已讀的邏輯
1. 使用者讀取了代表已讀
2. 當使用者在連線中並且有在該畫面代表已讀(畫面要有被focus才代表已讀，若是跳窗不算)
3. 反之使用者離線絕對是未讀

接著整理一下上面的邏輯，實做程式碼的部分應該是以下這樣的
1. 當送出訊息時，我們先看對方(先把多人的狀況考慮進來)的在線狀態，將在聊天室內*讀取中*並且*登入中*的人寫入訊息讀取人的欄位。
2. 當使用者第一次進入該聊天室時，把所有訊息讀取人不包含自己的加上自己

開始時做送訊息前，我們必須先時做是否在聊天室中，這邊一樣想一下邏輯
#### 是否在聊天室中
1. 當進入這個網址時寫入這個聊天室的讀取中，當離開就寫入離開
2. 當跳窗，也要寫入離開狀態(我們可以透過focus來實做)
3. 當直接關閉的時候，我們不做處理，因為在判斷已讀的時候我們也會一併判斷登入狀態

#### 畫面已讀數量顯示
畫面的部分，我們只需要看該訊息已讀的人的數量即可知道，有幾人已讀。

實做的順序應該是這樣的：
1. 是否在聊天室中
2. 訊息送出已讀人員寫入
3. 畫面已讀數量顯示
4. 第一次進入後未讀的資料標示已讀

OK，了解了基本的邏輯了，那我們開始實做。

## 是否在聊天室中
我們必須知道使用者是否有focus視窗，因此我們要先建立window的focus監聽，筆者是直接在app.component建立

我們在app.component綁定window的focus狀態，這裡使用Angular `Renderer2`來實做，之所以用renderer是因為Angular是一個跨平台的語言，如果直接使用addlistiner可能會因為在其他平台不是DOM物件而無法綁定，這部分Angular有幫我們做處理，以下實做
```js
constructor(
  private _renderer: Renderer2,
  private _loginState: LoginStatusService,){    
  if (window) {
    this._renderer.listen(window, 'focus', () => {
      this._loginState.changeFocus(true);
    });
    this._renderer.listen(window, 'blur', () => {
      this._loginState.changeFocus(false);
    });
  }
}
```
一樣在constructor注入，這邊我們判斷一下有無window物件之後再做監聽，我們在`LoginStatusService`建立一個BehaviorSubject來存狀態，在透過方法來改變狀態
```js
userFocusStatus$ = new BehaviorSubject<boolean>(false);

changeFocus(status: boolean) {
  this.userFocusStatus$.next(status);
}
```
之所以放在LoginStatus是因為筆者覺得這是屬於登入狀態的一環，或許之後會有交集，放在這裡比較容易處理，與識別。


接著我們要實際的使用他，筆者在message.service內部加上以下參數與方法

```js
myReadStatusHandler: DocumentHandler<RoomUsersModel>;
setReading() {
  console.log('reading');
  if (this.myReadStatusHandler)
    return this.myReadStatusHandler.update({ isReading: true });
  return of(null);
}

setLeave() {
  console.log('leave');
  if (this.myReadStatusHandler)
    return this.myReadStatusHandler.update({ isReading: false });
  return of(null);
}
```

然後回到聊天室的component，message-detial.component，在最前面取得訊息知的地方加上取得狀態的，我們用merge包起來，一起訂閱
```js
merge(
  // 取得訊息相關
  message$,
  // 取得使用者狀態
  this._loginStatus.userFocusStatus$.pipe(
    switchMap(status => {
      if (!status) {
        return this._message.setLeave();
      }
      return this._message.setReading();
    })
  ))
  .pipe(takeUntil(this._destroy$))
  .subscribe();
```
當狀態為focus就寫入reading中，反之則是離開

接著我們取得訊息的部分也要一併取得聊天室中所有人的聊天狀況，並且當換房間的時候也要一併寫入離開狀態
```js
private getRoomsMessages(roomId): Observable<any> {
  // 檢查房間ID是否改變
  if (this.roomId && this.roomId !== roomId) { // 如果有房號，且又不同才要寫入離開
    console.log('room changed');
    this._message.setLeave();
  }
  this.roomId = roomId;
  this.roomHandler = this.roomsHandler.document<RoomModel>(roomId);

  this.roomUsersHandler = this.roomHandler.collection('users');
  this.roomMessageHandler = this.roomHandler.collection('messages');

  this._message.myReadStatusHandler =
    this.roomUsersHandler.document<RoomUsersModel>(this.sender.uid);

  // 這裡依樣用merge來包裝所有的observable
  return merge(
    // 取得檔案
    this.roomHandler.collection<any>('files').get().pipe(
      tap((files) => {
        this.roomFiles = arrayToObjectByKey(files, 'id');
      })
    ),
    // 取得人員
    this.roomUsersHandler.get().pipe(
      tap((users) => { // 這裡直接過濾掉自己，因為我們不需要把自己發出的訊息讓自己已讀
        this.roomUsers = users.filter(u => u.id !== this.sender.uid);
        console.log(this.roomUsers);
      })
    ),
    // 取得訊息
    this.roomMessageHandler.get({
      isKey: true,
      queryFn: ref => ref.orderBy('updatedAt')
    }).pipe(
      tap(messages => {
        this.messageLoading = false;
        this.messages = messages;
        this.scrollButtom();
        console.log('get message');
      })
      )
  );
}
```

OK，到這邊我們算是取得所有人的狀態了，並且直接過濾掉自己，因為我們不需要把自己發出的訊息標示自己已讀。
可以用console.log顯示一下目前取得的人員的狀態。

到這裡我們設定當下讀取狀態及取得所有使用者讀取狀態算是完成了，接者我們實作送出訊息時的部分。

## 訊息送出已讀人員寫入

在開始前，因為我們可能會一次寫入多筆，我們當然可以一次一次寫，但是firebase有提供整個批次寫入的功能，那就是batch，筆者這邊先講解一下基本邏輯，並且一樣透過我們的base.http來做包裝

基本就是他會new 一個 batch物件，然後透過batch物件來新增刪除修改資料，最後再一併commit送出。

#### Batch 批次寫入 Handler 建立

以下我們直接透過自己的Handler來實做
```js
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { storeTimeObject } from './store.time.function';
import { DocumentHandler } from './index';

export class BatchHandler {
  private _batch: firebase.firestore.WriteBatch;

  // 當我們建立handler時，一併建立batch物件
  constructor(_afs: AngularFirestore) {
    this._batch = _afs.firestore.batch();
  }

  // 用Observable把promise包裝起來
  commit(): Observable<void> {
    return fromPromise(this._batch.commit());
  }

  set(
    documentHandler: DocumentHandler<any>,
    data: firebase.firestore.DocumentData,
    options?: firebase.firestore.SetOptions
  ) {
    this._batch.set(documentHandler.ref, storeTimeObject(data), options);
  }

  delete(documentHandler: DocumentHandler<any>) {
    this._batch.delete(documentHandler.ref);
  }

  update(documentHandler: DocumentHandler<any>, data: firebase.firestore.UpdateData) {
    this._batch.update(documentHandler.ref, storeTimeObject(data, false));
  }
}
```
我們這邊資料的存取都會加上我們寫好的storeTimeObject方法，把時間也寫上去
因為我們外部都是使用自己的documentHandler，因此我們直接傳入Handler在那部取得他的ref，至於ref的取得，我們回到`DocumentHandler`使用get方法來實做
```js
get ref() {
  return this._fireAction.ref;
}
```
最後在回到base.http.service，把剛剛的方法加上去
```js
batch() {
  return new BatchHandler(this._afs);
}
```
如此一來我們就能使用batch來做操作了。

## 使用BatchHandler批次寫入資料
我們回到訊息中，在送出訊息的時候，直接看有哪些人是讀取中，直接寫入他們已讀。
```js
private getMessageObs(content, type = MESSAGE_TYPE.MESSAGE) {
  ...
  if (this.roomMessageHandler) {
    req = this.roomMessageHandler.add(message).pipe(
      switchMap(msg => {
        // 先建立batch物件
        const batchHandler = this._http.batch();

        // 取出所有正在讀取的人，設定他們進入已讀清單，直接用他們的id當作document id
        this.roomUsers
          .filter(u => u.isReading)
          .forEach(user => {
            const readHandler = msg.collection(`readed`).document(user.id);
            batchHandler.set(readHandler, {});
          });

        // 最後在批次送出
        return batchHandler.commit();
      })
    );
  } else {
    // 第一筆訊息，房間尚未建立，不可能已讀不需做處理
    req = this._http.request('/api/message/roomWithMessage').post({
      message: message
    });
  }
  return req;
}
```

訊息送出已讀人員寫入完成。


# 本日小節
我們能夠把使用者已讀狀態也寫入了，並且使用了batch物件，一次把想寫的資料送回去給firebase減少資料庫連線的次數，並且增加效能，接下來要接著實做讀取已讀幾人部分、第一次進入設定資料已讀的部分，我們留到明天，今天大家先吸收一下。

# 本日原始碼
|名稱|網址|
|---|---|
|Angular| https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day28_read_status_1|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day28_read_status_1|


# 參考資料
https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
