# [Angular Firebase 入門與實做] Day-07 Cloud Firestore - Hosting

# Hosting

firebase有提供我們靜態檔案hosting的功能，讓我們的Angular可以對外讓人連線過來。

* 安裝firebase-tools
```
npm i -g firebase-tools
```
* 登入firebase
```
firebase login
```
他會詢問你要不要給他們收集錯誤訊息，筆者想幫助開發團隊，所以筆者選是
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/login0_dzaath.jpg)

接著會轉跳到瀏覽器選擇登入帳號
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/login_u4ecqk.jpg)

登入後，會要求權限，允許後會顯示以下畫面
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/login2_axougr.jpg)

回到終端機看到以下畫面你就登入成功了！
```
Waiting for authentication...

+  Success! Logged in as 
```

# Firebase 專案初始化
```
firebase init
```
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/init1_bvtp2p.jpg)
1. 是否繼續，Y 繼續
2. 要使用那些功能，這裡我們把全部都選起來，database、firestore、hosting、functions、storage
3. 選擇你要使用的專案
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/init2_gpzqyi.jpg)
1. 選擇語言，我們選擇ts
2. 是否要使用tsline，yes
3. 是否現在安裝npm package，false我們以後再安裝
4. 預設資料夾是哪裡 輸入dist
5. 使否所有網址導向index.html，yes

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/init3_bysbzt.jpg)
1. 是否建立storage.rules檔案，yes

接著打開你的firebase.json，確認是否跟筆者的相同
```json
{
  "functions": {
    "predeploy": "npm --prefix functions run build",
    "source": "functions"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "database": {
    "rules": "database.rules.json"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

# Deploy 事前準備

1. 因為我們要使用prod的版本deploy到firebase，記得把envirenment.ts的config複製到envirenment.prod.ts。

2. 編譯
```js
ng build --prod --build-optimizer //用--prod --build-optimizer最佳化來編譯，最小化應用
```

# Deploy
* 我們雖然建立了其他相關的內容，筆者這邊展示只deploy hosting的部分
```js
firebase deploy --only hosting // --only 後面加參數就會只發布該內容
```
看到以下畫面代表是成功了！
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/deploy_svhb99.jpg)

我們可以直接點擊Hosting URL在瀏覽器中開啟畫面查看是否有錯誤。

> 完成！

## 加入script
最後我們當然可以把方法加入在`package.json`的script之中，以便我們將來做deploy
```json
"scripts": {
  "clean": "rimraf package-lock.json node_modules",
  "cleanAndUpdate": "ncu -a && npm run clean && ncu -d -a && npm install",
  "ng": "ng",
  "start": "ng serve -o",
  "build": "ng build",
  "test": "ng test",
  "lint": "ng lint",
  "e2e": "ng e2e",
  "deploy:firebase": "ng build --prod --build-optimizer && firebase deploy --only hosting"
}
```
未來我們只需使用`npm run deploy:firebase`就能把專案deploy更新上去了！

# 本日小節
今天我們把自己的專案deploy到firebase上了，相當簡單也很方便，筆者認為在deploy的部分，firebase設計的相當容易使用，相關的參數也很清楚，對使用者相當的友善。

# 參考文章
https://firebase.google.com/docs/hosting/?authuser=1
