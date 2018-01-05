# [Angular Firebase 入門與實做] Day-16 Cloud Functions Cloud Firestore Triggers

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> There is nothing noble in being superior to some other man. the True nobility is in being superior to your previous self. -- 優於別人，並不高貴，真正的高貴應該是優於過去的自己 (海明威)

今日成果： https://onfirechat.ga/message

昨天了解了HTTP Triggers了，我們今天接著講Cloud Firestore Triggers。

# Cloud Firestore Triggers

透過他我們可以不需要改我們客戶端的程式碼，當資料有變動時，自動觸發去執行任務，

基本上他是這麼運作的
1. 等待資料有變動
2. 資料變動，觸發Functions執行任務
3. 任務執行時會得到兩個變數，分別是修改前的資料(original data)和修改後的資料(new data)，我們可以針對他們做想做的事情。
4. 任務完成，回到1繼續等待資料有變動。

## 事件類型
要觸發事件有四種類型
| 類型 | 觸發狀況 |
| --- |-----|
|onCreate| 當資料*建立*時觸發 |
|onUpdate| 當資料*修改*時觸發 |
|onDelete| 當資料*刪除*時觸發 |
|onWrite | 當資料*發生上面三種任何一種*時觸發 |

> 注意，我們只能針對 document 發生變動做處理，無法針對單一欄位

# 實作 Cloud Firestore Triggers
我們回到index.ts建立一個firestore trigger

```js
export const users = functions.firestore
    .document('users/{userId}').onWrite((event) => {
        console.log(event);
        return 'complete'; // 記得一定要return一個value，每個trigger最後都會有一個return可以是promise或是value
    });
```

當我們使用serve的方式，你會發現，我們看不到usersHandler的方法，這是因為除了http之外的所有方法，都不能使用serve的方式，而是要使用另一種shell的方式，因此我們需要在修改一下package.json裡面的script

將start改成直接執行不再編譯了
```json
"start": "firebase experimental:functions:shell",
```

# 使用shell debug

我們開兩個終端機，一個跑編譯，另一個跑shell，用這種方式來debug，注意每次我們有新增functions或是改functions的name時都要重新跑shell才能執行，但是如果是只有改方法內的內容，不需要重新執行。
```
npm run build-w
npm start
```

當我們執行後會看到以下畫面
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/shell_zm5qoi.jpg)
他會顯示我們有那些functions，並且我們可以在下面做執行
```js
// 執行方法，使用方法名稱當作函數，裡面可以傳入參數，在firestore這裡我們使用的是物件的方式

users({data:'new'})
```
傳入的物件有幾種
|參數 | 說明| 範例 |
|-----|-----|---|
| 一個資料物件 | 此物件為當前的物件，不論是新增、刪除、或是修改都一樣，這個物件代表當前(修改之後)的狀態| users({data:'myData'})|
| 一個資料物件裡面有兩個屬性before、after裡面又分別放了一個物件 | before屬性的物件為原物件、after屬性的物件為新物件|users({data:'myData'})|
| 兩個參數 |第一個參數如上、第二個參數為params，例如document('input/{group}/{id}')，那們可以傳入的參數對應的為{params: {group: 'a', id: 123}}|users({before: {data: 'old'}, after: {data: 'new'} }, {params: {userId: '1'}})|

有了shell我們可以基本的的對functions做本機的測試，另外這裡的除了上面方法外，也可以宣告物件以便我們使用，如下圖
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/shell2_oswdrs.jpg)


但是筆者還是覺得相當不方便，他並無法連動到雲端的資料庫，所以當我們真正要使用上還是得deploy到firebase上看console來知道是否正常，目前看來是還沒有更好的方式，希望以後firebase能更新。


接著我們針對方法內可以調用的方法做介紹

# onCreate、onUpdate、onDelete、onWrite 基本使用

由於四個的基本使用都差不多，就不做重複地介紹，基本上就是相對事件發生時，會觸發相對應的事件
```js
export const users = functions.firestore
    .document('users/{userId}').onCreate((event) => { // {userId}這樣可以取得所有users的
        const nowData = event.data.data(); // 我們可以使用event.data取得當前的資料
        console.log(nowData);
        
        return 'complete!';
    });
```
event.data回傳的屬性有以下
```js
export interface DeltaDocumentSnapshot {
    exists: Boolean;
    ref: any; // DocumentSnapshot
    id: string;
    createTime: string;
    updateTime: string;
    readTime: string;
    previous: any; // DocumentSnapshot 這個屬性只有在有上一個數值時能使用
    data: () => any; // 取得當前的資料
    get: (key: string) => any; // 取得某個property的數值
}
```
大致有以上屬性，使用上有一點很重要！就是在使用previous要確定數值確實存在(建立的時候不存在，取得會是null，若.data()會暴掉)

下面我們實作一個trigger來試試看，

## 實作最新訊息功能
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515156271/trigger1_jyx9m7.jpg)

以下實做邏輯：
  當寫入一筆最新訊息時更新使用者的room的最後訊息，讓我們在查看room時能最快速知道*最後一句留言是什麼*
```js
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { storeTimeObject } from '../../libs/timestamp';

// 當訊息有資料寫入時觸發
export const roomsMessagefirestore = functions.firestore
  .document('/rooms/{roomId}/messages/{messageId}').onCreate((event) => {
    const firestore = admin.firestore();

    const roomId = event.params.roomId;
    const messageId = event.params.messageId;

    const message = event.data.data();

      // 更新這個人對應到另一個人的最後一句資料
    return Promise.all([
      firestore.doc(`users/${message.sender}`)
        .collection('rooms')
        .doc(message.addressee)
        .update(storeTimeObject({ last: message }, false)),
      // 兩個人的都要更新
      firestore.doc(`users/${message.addressee}`)
        .collection('rooms')
        .doc(message.sender)
        .update(storeTimeObject({ last: message }, false)),
    ])
  });

```

接著當我們新增room底下的訊息時就會觸發這個trigger然後前端透過realtime的特性，就能得到資料了，
展示如下
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515156002/storeTrigger_rtvz5w.gif)


# 本日小節
今天我們介紹了firestore 的 trigger，可以說是相當方便，讓我們可以大幅的減少我們在client的邏輯，並且透過他我們就算是直接在firebase的管理中心修改內容也是可以觸發的，大大提升了我們系統的穩定，舉例來說，當我們想刪除room時，我們只需透過刪除主要的room其餘的動作都透trigger來執行，就能做到把資料刪除乾淨的行為，client可以保持邏輯清晰，可說是很不錯，但是就是在開發上還是很多不便利，本機雖然可以透過shell的方式做到基本的測試，但是依舊無法像在雲端一樣的直接操作資料庫，希望未來我們可能可以透過firebase提供的工具來連線到雲端做本地端的操作，不然每次都要deploy實在是相當不方便。


對於入門來說，筆者很推薦大家看這個系列的影片，雖然是英文的但是說得很清楚，英文也很好聽(老師也很美XD
https://www.youtube.com/watch?v=EvV9Vk9iOCQ&list=PLl-K7zZEsYLkPZHe41m4jfAxUi0JjLgSM

# 參考文章
https://firebase.google.com/docs/functions/firestore-events?authuser=0
https://firebase.google.com/docs/reference/admin/node/admin.firestore.FieldValue?authuser=0
