# [Angular Firebase 入門與實做] Day-04 Cloud Firestore - 新增(Create)、讀取(Read)、更新(Update)、刪除(Delete)

> Cloud Firestore is a NoSQL, document-oriented database. Unlike a SQL database, there are no tables or rows. Instead, you store data in documents, which are organized into collections. Each document contains a set of key-value pairs. Cloud Firestore is optimized for storing large collections of small documents.

昨天我們知道了怎麼使用realtime Database了，但也知道了他的一些缺點，那我們再看看最新推出的Cloud firestore又是如何吧!

# Firestore

他主要有兩個物件，collection、document，如果有使用mongodb的會覺得很熟悉。

* 在管理介面啟用firestore，並且選擇以測試模式啟動
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/cloudstore_fixqog.jpg)

* 點擊新增資料，輸入名稱，點擊下一步，你會看到以下畫面
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/database_tou70e.jpg)
從圖可以看出來！在cloud firestore有類型，也就是這個欄位的類型，因此我們可以直接取得該類型的資料(舉例Date不再是timestamp，而是date物件)，並且！他擁有reference，未來會再說講解。

# 使用angularfire2/firestore API來對其做操作
在app.module注入AngularFirestoreModule，我們先前已經有注入了
`import { AngularFirestoreModule } from 'angularfire2/firestore';`


要注意這裡跟**realtime database** 有些不同
| 方法 | 可用的地方 | 回傳內容 |
| --------- |----- |--------- |
| valueChanges() | list, object | 資料本身不包含key |
| snapshotChanges() | list, object | 資料本身(payload)、key、prevKey、type|
| stateChanges() | list | 資料**最後一次**改變的內容<br />* 第一次取得時會得到**所有資料**，並且是資料新增"added"狀態 |
| auditTrail() | list | 資料修改的**過程**每次都會被記錄，都會被回傳出來，陣列會越來越大<br />* 第一次取得時會得到**陣列中所有資料added狀態** |

* stateChanges
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672293/stateChanges_omqapw.jpg)
第一次subscribe回傳1次(包含所有物件的狀態)，當下次有對資料做異動會回傳一筆next(1筆資料的陣列)
> 注意這裡只有一次next，與realtimeDatabase不同!


* auditTrail
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672293/auditTrail_store_qjukan.jpg)
第一次subscribe回傳1次(包含所有物件的狀態)，當下次有對資料做異動會回傳一筆next(所有處理過程的陣列，一值累計下去)

firestore 與 realtime Database 操作的方式相當雷同，這裡就不做展示，只針對不同的地方做講解，基本的使用大概是這樣：
```js
export class AppComponent {
  private itemDoc: AngularFirestoreDocument<Item>;
  item: Observable<Item>;
  constructor(private afs: AngularFirestore) {
    this.itemDoc = afs.doc<Item>('items/1');
    this.item = this.itemDoc.valueChanges();
  }
  update(item: Item) {
    this.itemDoc.update(item);
  }
}
```
* 要注意的是這裡取得server的時間的方式不同，改使用firestore物件的內容，如下：
```js
import * as firebase from 'firebase';

export function storeTimeObject(obj: any, isNew = true) {
  const newObj = {
    ...obj,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  if (isNew) {
    newObj.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  }
  return newObj;
}
```
* 另外取得物件key值(id)的方式也不同取得方法如下，筆者沿用mongodb物件的習慣，使用id作為key：
```js
// Collection
collection.snapshotChanges().map(actions => {
  return actions.map(a => {
    const data = a.payload.doc.data();
    const id = a.payload.doc.id;
    return { id, ...data };
  });
})
// document
document.snapshotChanges().map(a => {
  const data = a.payload.data();
  const id = a.payload.id;
  return { id, ...data };
})
```


以下我舉例我在使用上的方法，有了昨天封裝的基礎，我們也可以針對Cloud firestore做Class封裝：
* 在base.http.service加入方法
```js
  constructor(private _afs: AngularFirestore, private _db: AngularFireDatabase) { }

  collectionHandler(url: string) {
    return new CollectionHandler(this._afs, url);
  }

  documentHandler(url: string) {
    return new DocumentHandler(this._afs, url);
  }
```
CollectionHandler、DocumentHandler的實作方法與昨天的List、Object也雷同，這邊就不再贅述，讀者可試著自己建立看看，可以參考[官方文件](https://github.com/angular/angularfire2/blob/master/docs/firestore/collections.md)。

其餘使用方法也都相當雷同，但有一個很不同的地方！如果你打開F12去看socket你會發現資料傳輸的過程非常的神祕，筆者無法從network看出個所以然，可以說是相當神秘又厲害！

關於cloud firestore 與 realtime database的差異可以看官方的[BLOG](https://firebase.googleblog.com/2017/10/cloud-firestore-for-rtdb-developers.html)有詳細的說明。

# 本日小結
今天我們初步了解了firestore的基礎新刪修，了解到firestore它的強大的地方，特別是他那神秘的傳輸過程，今天是平安夜，祝大家平安喜樂，明天會針對firestore做query與相關用法作介紹。

本日範例：https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day4_cloudfiretore_base_use

# 參考文章
[https://github.com/angular/angularfire2/blob/master/docs/firestore/documents.md](https://github.com/angular/angularfire2/blob/master/docs/firestore/documents.md)

[https://github.com/angular/angularfire2/blob/master/docs/firestore/collections.md](https://github.com/angular/angularfire2/blob/master/docs/firestore/collections.md)
