# [Angular Firebase 入門與實做] Day-03 Realtime Database - 讀取(Read)-2、新增、修改、刪除

> Every day may not be good, but there's something good in every day.

昨天我們知道如何讀取到資料了，這邊統整介紹firebase提供的AngularFireAction API，方便我們在對資料操作。

## AngularFireAction

| 方法 | 可用的地方 | 回傳內容 |
| --------- |----- |--------- |
| valueChanges() | list, object | 資料本身不包含key |
| snapshotChanges() | list, object | 資料本身(payload)、key、prevKey、type|
| stateChanges() | list | 資料**最後一次**改變的內容<br />* 第一次取得時會得到**陣列中最後一筆**資料新增"child_added" |
| auditTrail() | list | 資料每一筆資料修改的過程，都會被回傳出來<br />* 第一次取得時會得到**陣列中所有資料child_added狀態** |

另外"**list**"的所有方法都可以傳入參數，塞選得到的內容 例如：`req.stateChanges('child_added')` 就只會當物件有新增的時候才會獲得資料

* stateChanges
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672293/stateChanges1_pnfjhu.jpg)
第一次subscribe回傳n次next(視有幾筆資料)，當下次有對資料做異動會回傳一筆next(1筆資料的**物件**)

* auditTrail
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672293/auditTrail1_i5ksxu.jpg)
第一次subscribe回傳1次next(包含n筆資料的陣列)，當下次有對資料做異動會回傳一筆next(4筆資料的**陣列**)

* 參數內容
```js
type ChildEvent = "child_added" | "child_removed" | "child_changed" | "child_moved"
```

## Querying list
除了直接取得資料，我們也能像SQL去對要取得的資料作處理，但是重點是這裡只是filter！稍後會講解。

* 排序與指定欄位

| 方法   | 功能            |
| ---------|--------------------|
| `orderByChild` | 跟據**子結點的內容**排序. |
| `orderByKey` | 跟據**鍵值**排序. |
| `orderByValue` | 根據**物件的內容**排序 |

* 判斷式 

| 方法   | 功能            |
| ---------|--------------------|
| `equalTo` | 根據數值來判斷是否**相同** |
| `startAt` | 根據數值來判斷是否**大於** |
| `endAt` | 根據數值來判斷是否**小於** |

* 限制取的數量

| 方法   | 功能           |
| ---------|--------------------|
| `limitToFirst` | 從第一個開始取幾個 |
| `limitToLast` | 從最後一個開始取幾個 |

有了初步的了解之後，我們實際來操作看看。
先修改base.http.server.ts，把queryFn加入進來
```ts
...
import { AngularFireDatabase, QueryFn } from 'angularfire2/database';

export interface BaseHttpConfig {
  isKey: boolean;
  queryFn?: QueryFn;
}
...
list<T>(url: string, config: BaseHttpConfig = { isKey: true }): Observable<T> | Observable<any> {
  const req = this._db.list(url, config.queryFn);
  return config.isKey ?
    req.snapshotChanges().map(
      actions => actions.map(action => ({ key: action.key, ...action.payload.val() }))) :
    req.valueChanges();
}
```
* 為了方便觀看，我們先匯入這個json檔案
[number.json](https://drive.google.com/open?id=142GR3j0fTG8dUb3aLEb7DB0S14wbQWpJ)

* 再來修正我們的app.component來試試看功能
```ts
this._http.list('numbers', {
    queryFn: (ref) =>  ref.orderByChild('name').equalTo('one'),
    isKey: true
  });
}
```
結果就知道是取出name為'one'的內容，

下面再舉幾個例子

```return ref.orderByChild('value').equalTo(1);```根據子結點value的內容為1的被取出來。
```return ref.orderByChild('value').startAt(1);```根據子結點value的內容大於1的被取出來。
```return ref.orderByChild('value').endAt(3);```根據子結點value的內容小於3的被取出來。

另外也能在串接limitToFirst
```ref.orderByChild('value').endAt(3).limitToFirst(2);```就會取出前兩個：1、2
```ref.orderByChild('value').endAt(3).limitToLast(2);```就會取出前兩個：2、3

至於orderByKey、orderByValue，使用的方法也與orderByChild一樣，只是對象變成key、value了。

> querying list 提供我們一些基本的對資料做操作的方法，有sort和基本的limit，筆者覺得在操作上還是相當不便利，包含像是reverse、或是複雜的query，在實作上還是相當困擾，不過基本的讀取是沒問題的。

>注意！如果你打開F12觀看socket的傳遞過程，你會發現它其實是全部取回來了，在記憶體中做操作，這是一個大問題，不知道是否是筆者使用錯誤(如下圖)。
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513873184640_vcdfss.gif)
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513873163153_vzmb3i.gif)

雖然有以上壞處，但是在存放固定的資料上，並不會有太大的問題，可以將其當作一個json資料夾，只是它的功能更強。

# 新增、修改、刪除

與mongodb相當類似，如果有使用過mongodb的小夥伴們會比較熟悉，沒使用過的，你可以將其視為一個array或是object。

## AngularFireList

list：

| 方法   | 功能           |
| ---------|--------------------|
| `push(data)` | 新增一筆資料 |
| `update(key, data)` | 修改key值所對應的資料，***如果不存在的property，會新增上去*** |
| `set(key, data)` | 設定key值所對應的資料，***完全覆蓋*** |
| `remove(key?)` | 如有傳入key就是刪除單一筆資料，***若沒有傳會把整個list刪掉*** |
> 特別要注意remove，如果沒有傳入key值，會把整個list刪除!!!

## AngularFireObject

object：

| 方法   | 功能           |
| ---------|--------------------|
| `update(data)` | 更新此筆資料，***如果不存在的property，會新增上去*** |
| `set(data)` | 設定此筆資料，***一樣是完全覆蓋*** |
| `remove()` | 刪除該筆資料 |

了解了基本用法後，我們可以建立一個class來封裝所有的行為。

## 加入新修時間
我們大多時候都會記錄新增(createdAt)、修改(updatedAt)的時間，當然你能使用js的Date物件來建立時間，但是那會有時區、使用者偽造時間的問題，因此firebase有提供一個存取道系統時間的功能``firebase.database.ServerValue.TIMESTAMP``。

我們可以建立一個function來針對資料做處理

db.time.function.ts
```ts
import * as firebase from 'firebase';

export function dbTimeObject(obj: any, isNew = true) {
  const newObj = {
    ...obj,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  if (isNew) {
    newObj.createdAt = firebase.database.ServerValue.TIMESTAMP;
  }
  return newObj;
}
```
當你針對資料作處理後，儲存到firebase時，他會以timestamp的方式儲存。
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672293/timestamp_qzolb5.jpg)

你可能會想這一組數字在回來之後處理不方便的問題，但是別擔心，Angular有提供[date pipe](https://angular.io/guide/pipes)的功能，只需在html作處理即可，如下
```html
<p>{{menu.createdAt | date:'yyyy-MM-dd hh:mm:ss'}}</p>
```

比這建議可以使用class把所有的方法封裝起來，以利我們將來的操作，或是抽換，由於實做比較複雜且每個人的習慣不盡相同，筆者這邊大概說明一下自己的封裝方式

在base.http.service建立兩個handdler分別處理list、object
```js
  constructor(private _db: AngularFireDatabase) { }
  listHandler(url: string) {
    return new ListHandler(this._db, url);
  }

  objectHandler(url: string) {
    return new ObjectHandler(this._db, url);
  }
```
我們將_db，url傳入，並回傳相對應的物件，而ListHandler大概是長這樣：
```ts
export class ListHandler {
  url: string;
  _fireList: AngularFireList<{}>;
  constructor(private _db: AngularFireDatabase, private _url) {
    this.url = _url;
    this._fireList = this._db.list(_url);
  }
  get(config: RealTimeDbConfig = { isKey: true }) {
    const req = config.queryFn ?
    this._db.list(this.url, config.queryFn) : this._fireList;
    return config.isKey ?
      req.snapshotChanges().map(
        actions => actions.map(action => ({ key: action.key, ...action.payload.val() }))) :
      req.valueChanges();
  }
  add<T>(data: T) {
    return Observable.fromPromise(this._fireList.push(dbTimeObject(data)));
  }
  delete(key: string): Observable<any> {
    return key ?
      Observable.fromPromise(this._fireList.remove(key)) :
      Observable.throw(new Error('no key!'));
  }
  update<T>(key, data: T) {
    return Observable.fromPromise(this._fireList.update(key, dbTimeObject(data, false)));
  }
  set<T>(key, data: T) {
    return Observable.fromPromise(this._fireList.set(key, dbTimeObject(data, false)));
  }
  drop() {
    return Observable.fromPromise(this._fireList.remove());
  }
}
```
筆者習慣使用Rx來做幫作，以便我們可以做複雜的operator來操作。
Object的物件大概實作方式也與List差不多，只是會add、drop的方法。

使用上我們可以這麼寫：
```ts
  menusHandler: ListHandler;
  constructor(private _http: BaseHttpService) {
    this.menusHandler = this._http.list('menus');
    this.menus$ = this.menusHandler.get({
      queryFn: ref => ref.orderByChild('updatedAt').limitToFirst(2),
      isKey: true
    });
  }
  add() {
    this.menusHandler.add({ title: '最新消息', value: 'news' });
  }

  delete(message: any) {
    this.menusHandler.delete(message.key).subscribe(RxViewer);
  }

  updateItem(message: any, value?: string) {
    this.menusHandler.update(message.key, { title: value }).subscribe(RxViewer);
    message.update = false;
  }
```
這裡個subscribe是不需要unsubscribe的，我們可以觀察RxViewer，會發現每次subscribe之後馬上就會進complete了，關於subscribe需要unsubscribe的時機，可以參考[Netanel Basal](https://netbasal.com/when-to-unsubscribe-in-angular-d61c6b21bad3)的這篇文章。



# 本日小結
今天我們算是了解了Realtime的新刪修查，以及資料要如何透過querying來做塞選資料，以及透過AngularFireAction時做新刪修，最後我們透過class封裝所有方法，讓我們在處理上更加便利，也容易抽換。

但是要注意一件事情！Realtime Database在做query list的處理上，依舊是會先得到所以資料的，筆者目前不知道是不是有使用上的錯誤，如果有知道的小夥伴們，歡迎提出一起討論！我們使用明天要說的firestore來做存取，明天繼續努力！

今天的source code可以參考這裡[StackBlitz](https://stackblitz.com/edit/angular-firebase-ironman-03)

# 參考文章
[https://github.com/angular/angularfire2/blob/master/docs/rtdb/lists.md](https://github.com/angular/angularfire2/blob/master/docs/rtdb/lists.md)

[https://github.com/angular/angularfire2/blob/master/docs/rtdb/querying-lists.md](https://github.com/angular/angularfire2/blob/master/docs/rtdb/querying-lists.md)


[https://netbasal.com/when-to-unsubscribe-in-angular-d61c6b21bad3](https://netbasal.com/when-to-unsubscribe-in-angular-d61c6b21bad3)