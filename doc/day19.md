# [Angular Firebase 入門與實做] Day-18 Cloud Functions Cloud Storage Triggers 03 顯示檔案與錯誤測試

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> A great secret of success is to go through life as a man who never  gets used up. -- 成功的祕訣是：經歷人生，就像一個永遠不會疲憊的人。

昨天我們透過ngxf-uploader實作了基本的檔案上傳的功能，但是因為時間的問題我們在顯示檔案上還有問題，今天我們來解決他

關於昨天有時候並不會呼叫倒轉檔的部分，那是因為我們的記憶體滿載

解決上船順序的問題

1. 改用concatMap，當檔案上傳完成後，才寫訊息到資料庫
```js
return fileHandler.upload({ file: file })
  .concatMap(() => this.getMessageObs(filePath, MESSAGE_TYPE.FILE))
  .subscribe(RxViewer);
```
當我們改使用concatMap後，我們因為是依序執行的，所以就不會有顯示的問題了，但是這有個缺點，就是當使用者圖片上來的時候，會沒辦法馬上看到上傳中的狀態，當然我們可以使用block來把畫面罩住，這也是個方法。

2. 使用store trigger 儲存當前聊天室的檔案，並且將他轉為物件，直接顯示出來

筆者會使用這種方法，不只能解決當前的問題，還能一併將未來會實作的這個聊天室的檔案一併取出來

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
最後在把昨天的container修改一下
html
```html
<!-- 這裡先判斷有時該物件，若沒有就是還沒加入files的陣列中，顯示loading -->
<ng-container *ngIf="roomFiles[message.content]; else imgloading">
  <div class="message-img mat-elevation-z2" *ngIf="message.content | img | async as img"
    [style.backgroundImage]="img | safe:'background-image'">
    <img  [src]="img">
  </div>
  <ng-template #imgloading>
    <div class="message-img" fxLayoutAlign="center center">
      <mat-progress-spinner mode="indeterminate" color="accent" [diameter]="20"></mat-progress-spinner>
    </div>
  </ng-template>
</ng-container>
```

# 本日小節
今天使用ngxf-uploader來實做檔案上傳及拖曳上傳，簡單的實作並結合trigger實作縮圖，讓我們在顯示使用這圖片的時候可以使用小縮圖，降低使用者載入的速度，筆者有注意到，目前storage的trigger感覺尚存在許多問題，筆者會發現有時縮圖並不會產生，並且完全沒有觸發，我想是尚有BUG，或是因為我們是免費版本的關係，但由於沒有錯誤訊息，暫時無法了解原因，若將來筆者有所了解再告知大家，明天我們將進一步解決圖片載入的問題。

# 參考文章
https://github.com/ZouYouShun/ngxf-uploader
https://ngxf-uploader.firebaseapp.com/upload
