# [Angular Firebase 入門與實做] Day-12 functions 前言(聊天室)

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> Those who are crazy enough to think they can change the world, then he can really change the world.

今日成果：https://onfirechat.ga/message

大家可以用測試帳號登入，或是自行註冊
帳號：test@gmail.com
密碼：aa1234

帳號：test2@gmail.com
密碼：aa1234

在開始使用functions之前我們先透過一個範例指出如果沒有使用functions會造成的問題。

我們會透過實作*做一個類似FB的聊天室*的方式來解說，並且讓大家看到firebase這種realtime database真正power的地方!!

# 前置作業
讓我們想一下，要如何存資料有便我們快速的存取到訊息，

聊天室有可能裡面有一個人或是多個人，
我們不管幾個人，都是開一間大聊天室，透過聊天室的`users:[]`欄位來確定內部有哪些人，

下面的實作會是nosql的方式，如果沒有用過nosql的朋友會有點不習慣，基本的邏輯就是因為彼此沒有關聯，我們必須透過自行設定的方式來建立連結。

因此我們在nosql的格式應該會是這樣的
```js
users:[
  senderUser1:{
    ...data,
    rooms:[
      addresseeUser2: roomid1
      addresseeUser3: roomid2,
      addresseeUser4: roomid3,
    ]
  }
]
```
如此一來我們就能很容易的知道sender有哪些聊天室，而聊天室對應到其他使用者的房號是多少，如下query的方式

而我們房間`rooms`的資料應該會是下面這樣
```js
rooms:[
  room1:{
    ...data,
    messages:[
      content:"內容文字",
      uid:"建立人ID",
      createdAt:"建立時間",
      updatedAt:"更新時間"
    ]
  }
]
```
再來我們整理一下邏輯，
> 我們會透過當前使用者得知對應的使用者的房號，在透過房號去取得房間內所有訊息的資料。

舉例：
當前的使用者為sender，
要發訊息的對像為addressee，

我們透過網址的參數得到收件人的addresseeId然後

1. 首先取得addressee的資料，以便我們知道接收人的相關資料
```js
return this._http.document<User>(`users/${addresseeId}`).get();
```
 
2. 再來取得sender資料裡room資料對應的addressee資料，以便得知兩者的roomID為多少
```js
return this._http.document(`users/${this.sender.uid}`)
  .collection('rooms')
  .document<UserRoom>(this.addressee.uid).get();
```

3. 最後用得到的roomId去取得房間的資料
```js
this.roomsHandler = this._http.collection('rooms');
return this.roomsHandler.document<Message>(usersRoom.roomId).get();
```

4. 最後透過房間的資料去取得房內的訊息
```js
this.messageHandler = this.roomsHandler.document(room.id).collection('messages');
return this.messageHandler.get({
  isKey: false,
  queryFn: ref => ref.orderBy('createdAt')
});
```

好了！到這邊你可能會覺得疑惑！這些方法不是都是Observable嗎？我要怎麼依序串接下來，難道要subscribe裡面包subscribe嗎？
> 千萬別這麼做!!!Rx有提供很多operator讓我們來做API的處理，這正是Rx真正強大的地方

Rx的相關用法，博大精深，對沒用過的使用者可能會覺得抽象，筆者推薦大家一些可以學習的資源，幫助我們了解Rx
https://www.learnrxjs.io/
http://rxmarbles.com/
http://reactivex.io/rxjs/manual/overview.html#operators

http://cn.rx.js.org/

以下稍微講解一下我們用到的方法

## 1. switchMap
> Map to observable, complete previous inner observable, emit values.
http://rxmarbles.com/#switchMap

你可以拖動彈珠圖，會比較能了解他是怎麼做的

簡單的說這個Operator是一種用來串接兩個API的方式，來源Observable發送後，會串接目標Observable且可以得到來源的節數，
並且它的特性是當來源Observable發送(next)第二次資料時，他會將目標的Observable正在作用中的subscribe取消，透過這個特性，我們可體搭配我們firebase的Observable來做串接API並且不用擔心會造成memory leak的狀況，實際使用如下：

將上面1~4做串接
```js
// 取得收件者資料
this._http.document<User>(`users/${addresseeId}`).get()
.switchMap(addressee => {
  // 把收件人資料存下來
  this.addressee = addressee;
  // 取得送出者對應收件者的聊天室資料
  return this._http.document(`users/${this.sender.uid}`)
    .collection('rooms')
    .document<UserRoom>(this.addressee.uid).get();
})
.switchMap(usersRoom => {
  // 如果收件者對應房間有資料，取得房間內容
  if (usersRoom) {
    return this.roomsHandler.document<Message>(usersRoom.roomId).get();
  }
  // 房間不存在，回null
  return Observable.of(null);
})
.switchMap(room => {
  // 如果房間資料存在
  if (room) {
    // 把房間的資料處理存下，後面用來作新增訊息
    this.messageHandler = this.roomsHandler.document(room.id).collection('messages');
    // 取得房間所有訊息的資料，並根據createdAt的時間來排序
    return this.messageHandler.get({
      isKey: false,
      queryFn: ref => ref.orderBy('createdAt')
    });
  }
  return Observable.of(null);
});
```

如此一來我們就能串接API取得房間的內容了！再來你可能會問，那當前sender的資料、收信人的id怎麼取得？
在Angular我們取得網址參數一樣式透過observable來取得，這樣就算再過成功router有變化我們也能知道，是很棒的設計，
但是在先前帳號認證的時候，我們的當前使用者的資料也是用observable包裝的，我們要怎麼讓兩個資料也一起串進取得訊息資料的過程呢？

所以這邊要介紹另一個operator

## combineLatest
http://rxmarbles.com/#combineLatest

他可以把兩個Observable合併起來，並且當兩個都有回傳數值的時候回傳第一次數值，接者只要有回傳，就會取代前一個的內容，並將兩個合成一個陣列一起回傳，讀者以樣可以拉拉看彈珠圖幫助自己理解。

因此我們可以這樣做：
```js
this._route.params
// 用filter來取得有使用者的時候，因為我們的currentUser$是一個BehavirSubject，當訂閱時就會回傳第一次，我們不想得到null，!!u是偷懶的寫法，他相當於  if(u){return true;}
  .combineLatest(this._auth.currentUser$.filter(u => !!u))
  .switchMap(([addressee, sender]) => { // 這裡可以用這樣的宣告方式直接宣告陣列內第一個和第二個的變數
    // 每次更換使用者前我們先將所有參數清空
    this.init();
    this.sender = sender;

    return this._http.document<User>(`users/${addressee.id}`).get();
  })
  .switchMap(addressee => {
  // 把收件人資料存下來
  this.addressee = addressee;
  ...
  // 如上一段的code做串接
  }

```

到這邊我們基本的取得算是到一段落了，在來我們實做如何新增訊息

## Add Message
```js
submitMessage() {
  // 取得表單的content的資料，先把資料存下來
  const content = this.messageForm.value.content;
  // 如果資料是空的，不送出
  if (!content) {
    return;
  }
  let req: Observable<any>;
  // 先把表單清空
  this.messageForm.reset();
  // 查看當前的messageHandler是否存在，若存在代表這個房間已經建立了，我們可以直接新增訊息
  if (this.messageHandler) {
    // 直接新增訊息進去
    req = this.messageHandler.add({
      uid: this.sender.uid,
      content: content
    });
  } else {
    // 房間不存在，所以我們要先建立房間
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
  }
  // 最後訂閱並觀看結果
  req.subscribe(RxViewer);
}
```
## forkJoin
這邊介紹上面看到的forkJoin
https://www.learnrxjs.io/operators/combination/forkjoin.html
當所有observable完成的時候，會回傳一次結果，並進入complete，並且可以在訂閱的結果取得所有送出後的結果，這正好是我們要的，因為我們要一次把這些資料都寫入，若想要使用寫入後的結果也可以從訂閱的內容取得。

PS: 這裡我們也能用merge因為都只會回傳一次，但要注意，forkJoin與merge不同的地方是它是合併成一個next而且是當所有都complete才會一次送出，而merge的話則會next多次，看你有merge幾個。

最後我們的在html加上相對應的tag就能完成了！
```html
<section class="message-container" fxLayout="column nowrap">
  <article fxFlex="1 1 auto" #article>
    <ul>
      <ng-container *ngFor="let message of messages" >
        <li class="mar-t-b-1 sender"
          *ngIf="message.uid === sender.uid; else addresseeView">
          <span class="content pad-all-1"
            [matTooltip]="message.createdAt | date:'hh:mm'" matTooltipPosition="left">
            {{message.content}}
          </span>
          <!-- 這裡是透過createdAt會等資料寫入後才回來的特性來達到資料送出成功的感覺 -->
          <i class="isSend material-icons"
            [ngClass]="{complete: message.createdAt}">done</i>
        </li>
        <ng-template #addresseeView>
          <li class="mar-all-1 addressee">
            <img class="avatar-img mar-r-1 "
              [src]="addressee.photoURL || 'assets/img/avatar.jpg'"
              [matTooltip]="addressee.displayName" matTooltipPosition="left"
              alt="addressee photo">
            <span class="content pad-all-1"
              [matTooltip]="message.createdAt | date:'hh:mm'" matTooltipPosition="right">
              {{message.content}}
            </span>
          </li>
        </ng-template>
      </ng-container>
    </ul>
  </article>
  <footer fxFlex="1 1 65px">
    <form [formGroup]="messageForm" (ngSubmit)="submitMessage()"
      fxLayout="row nowrap"
      fxLayoutAlign="center center">
      <mat-form-field fxFlex="1 1 auto" fxFlexAlign="end">
        <input matInput autocomplete="off"
          formControlName="content"
          placeholder="{{sender?.email}}想說什麼呢？"
          >
      </mat-form-field>
      <div fxFlex="1 1 100px" class="t-al-c">
        <button mat-raised-button color="accent">送出</button>
      </div>
    </form>
  </footer>
</section>
```

如此我們就實作完成一個聊天室了！!!!

# 本日小節
今天可能比較硬一些，不過整體來說透過firebase我們能簡單的透過realtime database的特性實作出聊天室，但是有一個很嚴重的問題也就是之所以今天會用它當作functions的前言的原因，大家會發現，我們會在上面做多次的資料庫溝通，去去回回，這對系統來說是一個負擔，且firebase的收費也是根據讀寫的次數來決定的，可以說絕對不能這麼做，這麼做的話傳遞的速度及過程會跑很多次，很快就會把我們的預算給燒光的XD，雖然說firebase的收費可以說是相當便宜，大家可以透過這裡來計算https://firebase.google.com/pricing/?authuser=1#blaze-calculator，但是這對我們前端也會造成負擔，所以我們會透過functions來做包裝！讓方法能更加漂亮，直觀！明天我們會介紹到底怎麼使用functions，敬請期待!

本日範例：https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day12_preface


# 參考文章
https://www.learnrxjs.io
http://rxmarbles.com
http://reactivex.io/
