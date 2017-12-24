> Smile and let everyone know that today you're a lot stronger than you were yesterday.![/images/emoticon/emoticon69.gif](/images/emoticon/emoticon69.gif)

2017是一個技術爆炸的一年，特別對Angular來說更是如此，今年真的讓我們又愛又恨，充滿驚奇，有許多新東西不斷進入了我們的世界中，筆者是一名使用Angular在前端世界裡游泳的開發人員![/images/emoticon/emoticon31.gif](/images/emoticon/emoticon31.gif)，筆者喜歡並享受在撰寫Typescript、Angular時的優雅與穩定，透過這次鐵人賽，筆者想給自己一個機會究並實做Angular Firebase，也分享自己這一年寫Angular的一些小經驗給大家。

# Firebase
Firebase 是Google提供的一個nosql Database並且是一個**Realtime Database**，Realtime Database? 或許你沒聽過，簡單概述就是他**透過機制可以在server資料改變的時候"自動"(websocket)通知client讓client做想做的事情**，我們完全不需要對這個資料同步去做處理，只需要CRUD資料就會自動改變了，有了Realtime batabase可以讓我們在撰寫程式的時候省去很多必要的行為，讓資料能更加獨立，並能加速開發的時程。

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513739844891_dt9huv.gif)
* 這是Firebase後端的資料庫管理中心，可以看到我們只要有修改資料在我們任何的載具上，資料會自動更新，是不是很酷！

並且Firebase有提供**storage、Hosting、Authentication**的功能，讓我們能更專注的在應用的撰寫上。

> 覺得很厲害!? Firebase還有更厲害的!

## Firebase functions
Firebase Functions 提供我們能在沒有後端的情況下撰寫一些後端的程式碼在上面，讓我們能真正達到Severless的境界，並且可以收發信件、金流串接、SSR(server side rendering)、等等
[![Yes](https://img.youtube.com/vi/IRk6n3M4d2E/0.jpg)](https://www.youtube.com/watch?v=IRk6n3M4d2E)
# Angular
Angular也是Google家的產品，他使用Typescript，Typescript是Javascript的超集合，透過他的Types做強行別的檢查，讓我們撰寫的javascript更加穩定，並且它有優美的intelli sense!!!(**寫錯會紅紅的XD**)，關於Angular的詳細教學及解說，可以參考網路上各位大大們的文章，已經有很多詳細的教學，這邊就不再贅述，這邊會專注在[angularfire2](https://github.com/angular/angularfire2)以及一些自己撰寫上的經驗的分享，同時筆者也會操作並使用AngularFire2來操作Firebase。

## AngularFire2
AngularFire2 是 angular團隊針對Firebase推出的官方library，他使用RxJs(如果沒聽過的強烈推薦先去朝聖一下[30 天精通 RxJS](https://ithelp.ithome.com.tw/users/20103367/ironman/1199))來實做，讓我們在操作Firebase能更貼近angular，並且在幾個月前正式推出了5.0的版本，而5.0的版本有不少異動，如果先前有使用過的朋友記得Follow[官方的升級文件](https://github.com/angular/angularfire2/blob/master/docs/version-5-upgrade.md)進行升級，這次鐵人賽將會使用5+版本來進行實作。

## 預計大綱 (持續更新)
* **建立Firebase專案 開發環境建立與初始化**
* **Realtime Database - 新增(Create)、讀取(Read)**
* **Realtime Database - Querying list**
* **Realtime Database - 更新(Update)、刪除(Delete)**
* **Cloud Firestore - 新增(Create)、讀取(Read)**
* **Cloud Firestore - querying list**
* **Cloud Firestore - 更新(Update)、刪除(Delete)**
* **Cloud Firestore - offline-data**
* **Authentication -  E-mail登入認證**
* **Authentication - google登入**
* **Authentication - facebook登入**
* **Authentication - 加入身分管理**
* **Storage - 上傳檔案**
* **Storage - 讀取檔案並使用身分認證**
* **Hosting - 部屬你的第一個APP**
* **Functions - functions簡介**
* **Functions - SSR(server side rendering)**
* **Functions - SSR Transfer HttpCache**
* **Functions - 寄信**
* **專案實做5~10天**

## 自我期許
筆者在今天撰寫時發現Firebase在4.8.1有一些break change，他們將types獨立出去了，導致在使用AngularFire2時因為尚未更新，會有錯誤產生，所以本文在angularFire2更新前會先使用**Firebase4.8.0**的版本。

不果筆者認為有改變就是好事，有改版代表成長有需求！就像我們在軟體的世界，唯有改變才能成長！

世界一直改變！不變的只有我們能**保持不斷的學習**！期許自己在30天的過程中能有更進一步，筆者只是一為初前端的小小，歡迎大家一起討論，切磋！![/images/emoticon/emoticon08.gif](/images/emoticon/emoticon08.gif)

# 參考連結
* [https://github.com/angular/angularfire2](https://github.com/angular/angularfire2)
* [https://console.firebase.google.com](https://console.firebase.google.com)
* [https://firebase.google.com/](https://firebase.google.com/)
* [https://www.youtube.com/watch?list=PLl-K7zZEsYLmOF_07IayrTntevxtbUxDL&time_continue=2&v=iosNuIdQoy8](https://www.youtube.com/watch?list=PLl-K7zZEsYLmOF_07IayrTntevxtbUxDL&time_continue=2&v=iosNuIdQoy8)
* [https://ithelp.ithome.com.tw/users/20103367/ironman/1199](https://ithelp.ithome.com.tw/users/20103367/ironman/1199)