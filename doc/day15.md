# [Angular Firebase 入門與實做] Day-15 Cloud Functions Cloud Firestore Triggers

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> No matter what label is thrown you way, only you can define yourself.

今日成果： https://us-central1-my-firebase-first-app.cloudfunctions.net/helloWorld

昨天了解了HTTP Triggers了，我們今天接著講Cloud Firestore Triggers。

對於入門來說，筆者很推薦大家看這個系列的影片，雖然是英文的但是說得很清楚，英文也很好聽(老師也很美XD
https://www.youtube.com/watch?v=EvV9Vk9iOCQ&list=PLl-K7zZEsYLkPZHe41m4jfAxUi0JjLgSM

# Cloud Firestore Triggers

透過他我們可以不需要改我們客戶端的程式碼，當資料有變動時，自動觸發去執行任務，

基本上他是這麼運作的
1. 等待資料有變動
2. 資料變動，觸發Functions執行任務
3. 任務執行時會得到兩個變數，分別是修改前的資料(original data)和修改後的資料(new data)，我們可以針對他們做想做的事情。
4. 任務完成，回到1。

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
