# [Angular Firebase 入門與實做] Day-05 Cloud Firestore - Querying Collections-2 offline-data

> To improve is to change, to be perfect is to change often.

* 今日demo： https://my-firebase-first-app.firebaseapp.com/

# 昨日改進

今天先修正一下昨天的方法，並在collection加入一些欄位metadata、doc的欄位以讓我們在做比較時更容易

```js
req.snapshotChanges().map(actions => {
  return actions.map(a => {
    const data = a.payload.doc.data();
    const doc = a.payload.doc;  // 把doc也保留，這樣我們做資料的比較可以直接使用
    const id = a.payload.doc.id;
    return { id, doc, metadata, ...data };
  });
}) 
```
在昨天的handler就能直接用
* ts
```js
handler(doc, type) {
  this.query.next(ref => ref.orderBy('updatedAt', 'asc')[type](doc));
}
```
* html
```html
<button (click)="handler(message.doc, 'endAt')"> <= </button>
```

# offline-data
離線資料是firebase提供的相當powerful的功能，特別針對手機用戶在連線狀況不穩的時候，當連線異常時他會*自動*把資料存在cache，並在連線後重新把資料送出，有的這個功能，我們可以輕易地辦到像是line、message等等通訊軟體的送出狀態的功能，也讓使用者在操作上更加便利，與自然，不會因為網路不穩定，讓使用者不斷地重新輸入、發送。

* 加入offline功能
只需在`app.module.ts`的地方將AngularFirestoreModule後面加上`enablePersistence()`就完成了！
```js
AngularFirestoreModule.enablePersistence(),
```
> 這麼簡單!?!?!?沒錯!就是這麼簡單，你現有的所有的code都不需要改！

## 查看資料是否為離線資料並取是來自cache

為了方便觀看，我們將CollectionHandler的get做一下修改
```js
get(config: CloudFirestoreConfig = { isKey: true }): Observable<any> {
  const req = config.queryFn ?
    this._afs.collection(this.url, config.queryFn) : this._fireAction;
  return config.isKey ?
    req.snapshotChanges().map(actions => {
      return actions.map(a => {
        // 我們可以從doc.metadata取得相關的資料
        const metadata = a.payload.doc.metadata;  
        const doc = a.payload.doc; 
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, doc, metadata, ...data };
      });
    }) :
    req.valueChanges();
}
```
* matadata 包含兩個狀態，fromCache、hasPendingWrites
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/fromcache_matadata_xrzc0o.jpg)

| 屬性 | 功能 |
| ---| --|
|fromCache|是否來自cache|
|hasPendingWrites|是否等待寫入資料庫|

我們在messages-list的地方加上.do方法來觀察資料本身，do方法會在每次next發生時執行，可以放我們想做的事情，並不會影響資料本身，這個做法經常使用在我們想用對*得到的資料*做其他處理時使用。
```js
import 'rxjs/add/operator/do'; // 記得要import
...
...
...
constructor(private _http: BaseHttpService,....){
  ...
  this.messages$ = this.query.switchMap(queryFn => {
    return this.messagesHandler.get({
      queryFn: queryFn,
      isKey: true
    });
  }).do(d => {
    console.log(d);
  });
  ...
}
```

打開瀏覽器觀察一下，我們先將所有資料清空，然後新增資料
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/fromcache_cynuhc.jpg)
我們會發現當我們新增一筆資料時，他會回傳兩次next，
### hasPendingWrites
第一次的是true，因為他還在等伺服器回應回，所以是true
第二次為false，已經從伺服器回來了，所以是false
我們可以透過這個屬性做到LINE等通訊軟體的*已送出*、*送出中*的功能
### fromCache
兩次都為false，因為這筆資料是我們開啟瀏覽器後才新增的。

我們把網路斷線，並且新增一筆資料
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/fromca0_jd5xzf.jpg)
會發現他不會回應兩次了，只有第一次的回應，這時候他的hasPendingWrites是true的狀態，我們這時重新整理

我們依然可以看到剛剛新增的資料，但是沒有時間，而且兩個屬性都是true
```js
metadata:{hasPendingWrites: true, fromCache: true}
```
我們重新連線，稍後一下，大概30秒~1分鐘(或是直接重新整理)，他會自動重新連線，並回應資料
```js
metadata:{hasPendingWrites: false, fromCache: true}
```
統整一下我們看到的現象與邏輯，
1. fromCache只的是*當下*資料的來源，如果資料是當下新增的狀態必定為`false`
2. 所以資料都會被存入cache，而離線發送的資料因為不會得到回應，hasPendingWrites狀態為true
4. 再次進入APP時，所有fromCache狀態必定都是true
3. 任意一資料的hasPendingWrites為true時，firebase會發送請求給server，並回傳一次next

> offline-data只有在 Chrome, Safari, Firefox瀏覽器有支援這點大家要注意並不是每個瀏覽器都有支援的

# 本日小節
今天我們再次體會到firebase的強大，只能說科技一直在進化，真的非常的厲害，有機會大家可以去看firebase的sourcecode藉此時做自己的http方法，真的能給使用者煥然一新的使用體驗！

本日範例：https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day6_offline_data


# 參考文章
https://firebase.google.com/docs/firestore/query-data/query-cursors
https://github.com/angular/angularfire2/blob/master/docs/firestore/offline-data.md
https://firebase.google.com/docs/firestore/manage-data/enable-offline
