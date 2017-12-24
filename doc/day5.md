# [Angular Firebase 入門與實做] Day-05 Cloud Firestore - Querying Collections

> The past can hurt. But from the way I see it, you can either run from it, or learn from it.

# Querying Collections in AngularFirestore

| 方法  | 功能            |
| ---------|---------------|
| `where` | 建立一個query. *很重要的是！他可以Chained，你可以一直點下去* |
| `orderBy`| 根據特別數值做排序，*注意！他有第二個參數來選擇要遞增或是遞減！* |
| `limit` | 限制取得的數量 |
| `startAt` | 指定的數值開始於某個數值 |
| `startAfter` | 指定的數值在某個數值之後 |
| `endAt` | 數值結束在某個數值之前 |
| `endBefore` | 數值在某個數值之後 |

這邊逐一做介紹

## Where
```js
where(
  fieldPath: string | FieldPath, // 為field的名稱，或是FieldPath物件
  opStr: WhereFilterOp, //  '<' | '<=' | '==' | '>=' | '>'
  value: any //任意數值
): Query;
```
相關參數如註解
* 值得注意的是 FieldPath物件，若想使用該物件的ID進行比較我們可以使用 `firebase.firestore.FieldPath.documentId()` 來比較ID，如下
* 第二個參數要注意的是，使用的為*字串*的比較運算式，另外沒有使用三個等於的狀況===是不合法的，合法的只有上面那五種

使用範例：`ref.where(firebase.firestore.FieldPath.documentId(), '==', id)`

## orderBy
```js
orderBy(
  fieldPath: string | FieldPath, // 為field的名稱，或是FieldPath物件
  directionStr?: OrderByDirection // 'desc' | 'asc'
): Query;
```
* 注意第二個物件可以設定為遞增asc還是遞減desc
使用範例：`ref.orderBy('updatedAt', 'desc')`

## limit
```js
limit(limit: number): Query; // 傳入為正整數
```
就是取得幾個，使用上沒什麼要注意的
使用範例：`ref.limit(2)`

## startAt、startAfter、endAt、endBefore
這四個方法依據的參數是跟去orderBy內的參數來決定的
```js
startAt(...fieldValues: any[]): Query; //雖然他上面是可以給陣列，但是筆者自己測試是只能給單是值
startAt(snapshot: DocumentSnapshot): Query; // 也可以給DocumentSnapshot，不過通常都給數值，在前端鮮少使用此物件
```
這次個運算式相當類似就一起講解，基本上就是根據orderBy的欄位來進行
* startAt() 對應 >=
* startAfter() 對應 >
* endAt() 對應 <=
* endBefore() 對應 <
使用範例：`ref.orderBy('number', 'asc').startAt(3)`

了解了四個運算後我們可以稍微實作看看，這次我們講解一下怎麼在畫面上做資料的處理。

# Dynamic querying
動態的query資料，你可能會覺得不就是查詢資料嗎？查了又查就好了不是嗎？但是你可能忘記了很重要的一點！我們這裡使用的是Rx來做處理，而我們的資料實際上是一個不會結束的Observable，因此每次我們在切換filter資料時，必須要把上一個資料取消掉，不然會有[memory leak](https://zh.wikipedia.org/zh-tw/%E5%86%85%E5%AD%98%E6%B3%84%E6%BC%8F)的問題！這點在使用Rx時一定要注意！

因此我們這個時候可以透過`BehaviorSubject`來做處理，你可以把它當作一個揚聲器，我們可以手動的發送想發送的東西出去，只要有人跟我們索取我們就會把現在設定好的聲音放出去，他與Subject不一樣的地方是，每次我們問他他一定會回應最後一個數值，而Subject只有當發送的瞬間你有訂閱他才能有資料，並且是無狀態的。
當然你想透過Subject處理也可以，只是就是變成你要在OnInit時去觸發next跑你最先想顯示的內容。

* 建立一個BehaviorSubject並且裡面放QueryFn*注意import的位置要是angularfire2/firestore*
```js
import { QueryFn } from 'angularfire2/firestore';

query = new BehaviorSubject<QueryFn>(ref => ref.orderBy('updatedAt'));
```
我們初始orderBy updatedAt的時間，第二個參數可以不給，預設為'asc'

* 在contructor設定Observable，使用switchMap(之所以使用switchMap是因為他會cancel前面尚未完成的Observable)，並把queryFn傳入
```js
this.messagesHandler = this._http.collection('messages');

this.messages$ = this.query.switchMap(queryFn => {
  return this.messagesHandler.get({
    queryFn: queryFn,
    isKey: true
  });
});
```

* 建立幾個filter的方法
```js
getAll(number) {
  if (number) {
    return this.query.next(ref => ref.orderBy('updatedAt', 'asc').limit(number));
  }
  this.query.next(ref => ref.orderBy('updatedAt', 'asc'));
}

last(state: 'asc' | 'desc') {
  this.query.next(ref => ref.orderBy('updatedAt', state).limit(2));
}
// 使用documentId來比較ID
select(id) {
  this.query.next(ref => ref.where(firebase.firestore.FieldPath.documentId(), '==', id));
}
// 我們直接由View得到filter的方法，透過js的特性來使用方法
handler(doc, type) { 
  this.query.next(ref => ref.orderBy('updatedAt', 'asc')[type](doc.updatedAt));
}
```

* 最後在我們的畫面上加上button來測試看看
```html
<button (click)="getAll()">取全部</button>
<button (click)="getAll(1)">取1筆</button>
<button (click)="getAll(2)">取2筆</button>
<button (click)="getAll(3)">取3筆</button>
<button (click)="getAll(4)">取4筆</button>
<button (click)="getAll(5)">取5筆</button>
<button (click)="getAll(6)">取6筆</button>
<button (click)="getAll(7)">取7筆</button>
<button (click)="getAll(8)">取8筆</button>
<button (click)="last('asc')">最前兩筆</button>
<button (click)="last('desc')">最後兩筆</button>

<ul>
  <li *ngFor="let message of messages$ | async">
    <!-- View Content  -->
    ...
    <button (click)="handler(message, 'endAt')"> <= </button>
    <button (click)="handler(message, 'endBefore')"> < </button>
    <button (click)="select(message.id)"> == </button>
    <button (click)="handler(message, 'startAt')"> >= </button>
    <button (click)="handler(message, 'startAfter')"> > </button>
  </li>
</ul>
```
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/view_op02ur.gif)
我們可以對資料做基本的處理了~![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)

# 限制
了解了基本用法後，我們來談談限制

* 不可以對兩個不同欄位進行範圍類(>、>=、<、<=)的比較，但是要注意使用==是可以的
* Where與orderBy必須為同欄位

* 正確示範
```js
// 不同欄位，都是==，可以
citiesRef.where("state", "==", "CA").where("population", "==", 100000)
citiesRef.where("state", "==", "CO").where("name", "==", "Denver")
// 不同欄位，其中一個是==，可以
citiesRef.where("state", "==", "CA").where("population", "<", 1000000)
// 同欄位可以，可以
citiesRef.where("state", ">=", "CA").where("state", "<=", "IN")
// 不同欄位，但是其中一個是==，可以
citiesRef.where("state", "==", "CA").where("population", ">", 1000000)
// where使用*範圍*，並且串接orderBy，*欄位相同*，可以
citiesRef.where('population', '<', 1000000).orderBy('population')
```
* 錯誤示範
```js
// 不同欄位，並且兩個都是範圍類，不可以
citiesRef.where("state", ">=", "CA").where("population", ">", 100000)
// where使用*範圍*，並且串接orderBy，但是*欄位不同*，不可以
citiesRef.where('state', '>=', 'CA').orderBy('population')
```
## index
當出現以下狀況時，是可以的但是需要啟用index
```js
// where使用*等於*，並且串接orderBy，*欄位不同*，可以！但是需要使用index
ref.where('content', '==', '5').orderBy('updatedAt', 'desc')
// 串接orderBy，*欄位不同*，可以！但是需要使用index
ref.orderBy('content', 'desc').orderBy('updatedAt', 'desc')
```
當你在使用上方query時，會出現下方圖片
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/indexquery_xwb4ij.jpg)
這個時候你可以點擊他提供的連結，連結過去後，點擊建立
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/indexcreate_q5ys31.jpg)
系統會針對你使用的欄位們的狀態(遞增或遞減)建立index，建立完成就可以使用這個查詢了！
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/indexcreating_aqgybr.jpg)

* 注意：他是根據遞增遞減會有不同的索引，且索引建立後就不能編輯，只能刪除重新建立，所以剛剛建立的是desc的版本，如果要使用asc就必須再建立一次，索引我們將來還會再做講解。

* 注意2：如果是orderBy的串接，排序是依序下來的
舉例：
```js
ref.orderBy('content', 'asc').orderBy('updatedAt', 'desc')
```
他會先根據content做遞減的增的排序，然後在依據排序後的content內部的內容作更新時間的排序，舉例如下：
```js
// 先依據內容作遞增排序，所以這三個的順序為1
1(2017-12-24 10:31:54) //再依據這三個排序為1的，去比較時間，所以這個的排序為(1,1)
1(2017-12-24 10:30:07) //再依據這三個排序為1的，去比較時間，所以這個的排序為(1,2)
1(2017-12-24 10:30:05) //再依據這三個排序為1的，去比較時間，所以這個的排序為(1,3)
// 依序為2345689
2(2017-12-24 10:30:05)
3(2017-12-24 10:30:05)
4(2017-12-24 10:30:06) 
5(2017-12-24 10:30:06) 
6(2017-12-24 10:30:07) 
8(2017-12-24 10:30:41)  
9(2017-12-24 10:30:37)
```
這邊可能有點小複雜要小思考一下，不過通常我們在使用上是不會有兩個排序同時並存的就是了，通常都是==加上排序比較多

另外index也是可以手動新增的，但是官方並不建議，建議直接點擊錯誤提示的網址即可(注意如果你有多個帳號登入google要記得切換正確的帳號https://console.firebase.google.com/u/{帳號順序}/project/...)
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/indexma_nmk5l3.jpg)


# 本日小結
今天講解了基礎的query collection的方法，並且介紹了index的基本使用方式，有沒有覺得新的cloud firestore比起realtime database 強大且好用的許多呢？ 雖然剛出來的時候API改了一大堆，改了很多code QQ 
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon16.gif)

還有許多部份，大家想先了解的話可以參考[官方文件](https://firebase.google.com/docs/firestore/query-data/get-data)，
明天在講解一些進階的使用方法與offline神奇的地方，對了！今天是聖誕節！大家聖誕快樂~

# 聖誕快樂~
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)![](https://ithelp.ithome.com.tw/images/emoticon/emoticon54.gif)

本日範例：https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day5_query_collection

# 參考文章
[https://github.com/angular/angularfire2/blob/master/docs/firestore/querying-collections.md](https://github.com/angular/angularfire2/blob/master/docs/firestore/querying-collections.md)

[https://github.com/angular/angularfire2/blob/master/docs/firestore/collections.md](https://github.com/angular/angularfire2/blob/master/docs/firestore/collections.md)
