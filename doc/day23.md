# [Angular Firebase 入門與實做] Day-23 Progressive Web App with Firebase
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> Pride relates more to our opinion of ourselves, vanity to what we would have others think of us. -- 驕傲多數情況下，無非是我們對自己的看法，但虛榮卻指的是我們過於看中其他人對我們的評價。

前兩天我們使用了FCM來推波訊息，很酷沒錯，但是還是要開啟瀏覽器，依舊不是我們要的，因此我們可以搭配PWA來把我們的web包裝起來，讓他更像APP並且能在背景執行取得推波！

PWA是什麼？筆者這邊就不再贅述，詳細大家可以參考
[30 天 Progressive Web App 學習筆記](https://ithelp.ithome.com.tw/users/20071512/ironman/1222)
[Google 官方文件](https://developers.google.com/web/progressive-web-apps)

那我們直接開始設定環境吧~

在先前我們已經有加入推波的services worker了，我們今天要透過cli內建的serviceWorker來實做PWA。

首先我們到`.angular-cli.json`加入設定

在app底下加上`"serviceWorker": true`
```json
"environments": {
  "dev": "environments/environment.ts",
  "prod": "environments/environment.prod.ts"
},
"serviceWorker": true
```
接著我們要建立一個`ngsw-config.json`這是讓CLI使用的config檔案，注意名子不要打錯了
接著打開內容，相關詳細設定參數可以參考[官方說明](https://angular.io/guide/service-worker-intro)
或是這裡https://medium.com/google-developer-experts/a-new-angular-service-worker-creating-automatic-progressive-web-apps-part-2-practice-3221471269a1
```json
{
  "index": "/index.html",
  "assetGroups": [{
    "name": "app",
    "installMode": "prefetch",
    "resources": {
      "files": [
        "/favicon.ico",
        "/index.html"
      ],
      "versionedFiles": [
        "/*.bundle.css",
        "/*.bundle.js",
        "/*.chunk.js"
      ],
      "url": [ // 如果你有想要放的額外路徑，可以放在這裡
        "https://fonts.googleapis.com/icon?family=Material+Icons"
      ]
    }
  }, {
    "name": "assets",
    "installMode": "lazy",
    "updateMode": "prefetch",
    "resources": {
      "files": [
        "/assets/**"
      ]
    }
  }]
}
```
接著我們要安裝`@angular/service-worker`
`npm i @angular/service-worker`

回到app.module把此module加入
```js
ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production})
```

再來這邊要特別注意！筆者這裡卡了許久，不知道為何，在有angularfire2加入的狀況下，ngsw-worker.js就是不會被載入，筆者查了很多資料最後我們需要在`main.ts`底下加入以下才有辦法正常運作
```js
platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    if (environment.production && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js');
    }
  })
  .catch(err => console.log(err));
```
再來我們要在`index.html`加入一些meta讓瀏覽器知道這是PWA
```html
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="msapplication-starturl" content="/">
<meta name="theme-color" content="#ff8a65">
```

結束!接著我們只要`ng build --prod`就能產生一個pwa的架構了!
看一下dist底下的檔案，會多這兩個檔案
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515755650/cli-services-worker_pytofw.jpg)

接著我們deploy上去就能觀看到底有無常運作。

打開Chrome，F12到Application
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515755974/services-worker_tnc0gb.jpg)
注意筆者圈起來的這些地方有無檔案，若有代表你的pwa基本有運作了。

接著我們可以到Audits來測試看看我們的APP
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515756077/1515756040822_cgmrsw.jpg)

你會發現我們得到100分^_^
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515756211/pwa100_nbgtyb.jpg)
所有PWA的規格我們都達到了~

Audits也會同時讓我們了解我們APP的效能，我們可以專門針對某一個選項做檢測，透過這麼分數以下面的報告來了解我們有那些問題。

我們也可以在Android手機中新增到桌布
![](https://firebasestorage.googleapis.com/v0/b/my-firebase-first-app.appspot.com/o/1515756424244_Screenshot_20180112-192658.jpg?alt=media&token=f315a757-7836-4583-a355-8bfaf5c679c1)

如此一來就能像APP一樣操作我們的WEB了！推播也能很順利的收到=ˇ=

# 本日小節
今天加入PWA！我們的Angular firebase又更進一步了！有了PWA真的讓整個網頁的效能大幅的提升，載入速度也是非常的快！在Angular的世界裡，要加入更是簡單，透過CLI設定，我們就能讓原有的APP升級變成PWA了！

雖然目前ios尚未支援PWA，但是筆者相信不久的將來，一定會有的！讓我們一起期待!

# 本日原始碼
|名稱|網址|
|---|---|
|Angular| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day23_PWA|

# 參考資料
https://www.youtube.com/watch?v=9oYIepz4xvI
https://angularfirebase.com/lessons/hnpwa-angular-5-progressive-web-app-service-worker-tutorial/
https://medium.com/google-developer-experts/a-new-angular-service-worker-creating-automatic-progressive-web-apps-part-2-practice-3221471269a1
