# [Angular Firebase 入門與實做] Day-19 Cloud Functions Cloud Storage Triggers 03 修正聊天室顯示功能
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> A great secret of success is to go through life as a man who never  gets used up. -- 成功的祕訣是：經歷人生，就像一個永遠不會疲憊的人。

昨天我們透過ngxf-uploader實作了基本的檔案上傳的功能，但是因為時間的問題我們在顯示檔案上還有問題，今天我們來解決他

# 修改trigger

我們先修改roomsMessage.firestore.ts

我們在trigger裡面取得roomId，並且去更新room的files資料，然後一樣加入Promise.all的陣列中一並新增出去

此法不只能解決當前的問題，還能一併將未來會實作的這個聊天室的檔案一併取出來

修改trigger

我們先修改roomsMessage.firestore.ts

我們在trigger裡面取得roomId，並且去更新room的files資料，然後一樣加入Promise.all的陣列中一並新增出去
```js
export const roomsMessagefirestore = functions.firestore
  .document('/rooms/{roomId}/messages/{messageId}').onCreate((event) => {
    const firestore = admin.firestore();

    const message: MessageModel = event.data.data();
    
    const roomId = event.params.roomId;
    let fileHandler;
    if (message.type === MESSAGE_TYPE.FILE) {
      fileHandler = firestore.doc(`rooms/${roomId}`).collection('files')
        .doc(encodeURIComponent(message.content)).set({
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          creator: message.sender
        })
    }

    return Promise.all([
      // 更新這個人對應到另一個人的最後一句資料
      firestore.doc(`users/${message.sender}`)
        .collection('rooms')
        .doc(message.addressee)
        .update(storeTimeObject({ last: message }, false)),
      // 兩個人的都要更新
      firestore.doc(`users/${message.addressee}`)
        .collection('rooms')
        .doc(message.sender)
        .update(storeTimeObject({ last: message }, false)),
      fileHandler
    ])
  });
```

然後`npm deploy`更新上去

接著回到component內部，

修該取得message的地方
```js
// 建立兩個變數
private roomHandler: DocumentHandler<RoomModel>;
private roomFiles = {};
...
...
message$
  // 原本擺在subscribe的搬移到do裡面
  .do(messages => {
    this.messageLoading = false;
    this.messages = messages;
    this.scrollButtom();
  })
  // 使用switchMap當取完訊息後，去取得房間內所有的檔案內容
  .switchMap(() => {
    if (this.roomHandler) {
      return this.roomHandler.collection<any>('files').get()
        .do(files => {
          // 並且我們把陣列轉為物件，讓我們可以容易的取得，不需要find
          this.roomFiles = arrayToObjectByKey(files, 'id'); 
        });
    }
    return Observable.of(null);
  })
  .takeUntil(this._destroy$)
  .subscribe();
```

接著在取得roomsData的地方將這個roomHandler指定上去
```js
private getRoomsMessages(roomId): Observable<any> {
  this.roomId = roomId;
  // 取得ID的後面直接取得當前的roomHandler
  this.roomHandler = this.roomsHandler.document<RoomModel>(roomId);
  ...
}
```
最後在把昨天的container修改一下，我們把這整個file的部份抽出去做一個component

建立message-item-file.component
ts
```js
import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-message-item-file',
  templateUrl: './message-item-file.component.html',
  styleUrls: ['./message-item-file.component.scss']
})
export class MessageItemFileComponent {
  @Input() set data(value) {
    if (value) {
      // 之所以不加上這個判斷是當已經有訂閱了的話就不再訂閱了，避免changeDetection的問題
      if (!this.url$) {
        this.url$ = this._storage.ref(value.id).getDownloadURL().do(u => this.path = u);
      }
    }
  }

  url$: Observable<string>;
  path = '';
  constructor(private _storage: AngularFireStorage) { }

}

```
html
```html
<ng-container *ngIf="url$ | async; else imgloading">
  <div class="message-img mat-elevation-z2" [style.backgroundImage]="path | safe:'background-image'">
    <img [src]="path | safe:'url'">
  </div>
</ng-container>
<ng-template #imgloading>
  <div class="message-img" fxLayoutAlign="center center">
    <mat-progress-spinner mode="indeterminate" color="accent" [diameter]="20"></mat-progress-spinner>
  </div>
</ng-template>
```

最後注入module之後將原本的template替換掉
```html
<ng-container [ngSwitch]="message.type">
  <app-message-item-file *ngSwitchCase="'file'" [data]="roomFiles[message.content]"></app-message-item-file>
  <span *ngSwitchDefault class="content pad-all-1" [innerHTML]="message.content"></span>
</ng-container>
```

到這裡我們就修正好了，打開瀏覽器看看吧！
是不是乾淨很多呢？

# 本日小節
今天我們透過cloud store 修正了問題，關於storage的問題，經過昨天和今天的測試筆者研判是記憶體超載的問題，可能是筆者昨天測試的時候有形成無限迴圈把記憶體吃掉了，所以才會有這個狀況，大家在操作Storage做一些較複雜的處理時要注意記憶體的問題，如果不想冒這個風險，筆者建議大家還是使用傳統的HTTP Trigger較為保險。

透過js的特性將陣列轉為物件可以讓我們在找資料上相當快速且敏捷，可說是非常的好用。


# 本日原始碼
|名稱|網址|
|---|---|
|Angular|https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day19_functions_firestorage_3|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day19_functions_firestore_3|
