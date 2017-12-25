hosting

npm i -g firebase-tools

firebase login
他會詢問你要不要給他們收集錯誤訊息，好心的話可以選是
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/login0_dzaath.jpg)

接著會轉跳到瀏覽器選擇登入帳號
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/login_u4ecqk.jpg)

登入後，會要求全縣，接著會顯示以下畫面
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/login2_axougr.jpg)

回到終端機看到以下畫面你就登入成功了！
```
Waiting for authentication...

+  Success! Logged in as 
```

firebase init



![](https://res.cloudinary.com/dw7ecdxlp/image/upload/init1_bvtp2p.jpg)
1. Y 繼續
2. 選擇hosting、functions、storage
3. 選擇你要使用的專案
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/init2_gpzqyi.jpg)
1. 選擇語言，我們選擇ts
2. 是否要使用tsline，yes
3. 是否現在安裝npm package，false我們以後再安裝
4. 預設資料夾是哪裡 輸入dist
5. 使否所有網址導向index.html，yes

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/init3_bysbzt.jpg)
1. 是否建立storage.rules檔案，yes

接著打開你的firebase.json

記得把envirenment.ts的config複製到envirenment.prod.ts

ng build --prod --build-optimizer

firebase deploy --only hosting

最後我們當然可以把方法加入在package.json的script之中
```
"deploy:firebase": "ng build --prod --build-optimizer && firebase deploy --only hosting"
```
