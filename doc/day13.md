# [Angular Firebase 入門與實做] Day-13 Cloud Functions

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> Luck is not chance, it's toil. Fortune's expensive smile is earned.

今日成果： https://us-central1-my-firebase-first-app.cloudfunctions.net/helloWorld

在開始Cloud Functions前，筆者必須說Cloud Functions還在beta版本，這代表可能在未來會可能會有breakChange!
如果真的有很大的改版，筆者會在更新文章(有時間的話QQ，我盡量 >_<)

# 什麼是 Cloud Functions

簡單的說就是像字面上的意思，放在雲端的*方法們*，就是一堆方法，我們把他們放在雲端，當我們資料有變動、或是登入等等行為發生時，我們可以觸發一個function然後去做我們想要做的事情，當然我們也可以直接透過http去呼叫他們！

我們只需要把方法放上去，我們不用管理自己的伺服器、也不必對未來要升級做處理，只需把方法放上去，就能使用了！

這可以說是firebase真正達成serverless的原因，透過他我們甚至可以做到收發信件、金流管理、SSR等等需要後端才做得到的事情。

官方提到主要提供三大功能
1. 整合firebase平台，讓我們能透過triggers來處理我們的資料，減少http的傳輸來回
2. 0系統維護，我們不需擔心系統的設定、狀況，只要把方法放上去就對了
3. 安全性問題，一些機敏的資料我們可以透過functions來做，不會在前端處理

# Cloud Functions 的生命週期
1. 開發人員為新功能編寫代碼，選擇事件提供程序（如實時數據庫），並定義函數應執行的條件。
2. 開發人員部署該功能，Firebase將其連接到選定的事件提供程序。
3. 當事件提供者產生一個符合函數條件的事件時，代碼被調用。
4. 如果函數忙於處理許多事件，Google會創建更多的實例來更快地處理工作。 如果該功能空閒，則清理實例。
5. 當開發人員通過部署更新後的代碼來更新函數時，舊版本的所有實例都將被清理並由新實例替換。
6. 當一個開發人員刪除這個函數時，所有的實例都被清除，並且函數和事件提供者之間的連接被刪除。

Cloud Functions 在 google運行時也是會有記憶體的，要注意當我們刪除或是修改時，所有當下再存在的實例都會斷開連線並刪除。

# Cloud Functions 可以做能麼？
1. 當事件發生時自動通知使用者，包含使用簡訊、E-mail、推撥讓使用者得到最新消息
![](https://firebase.google.com/docs/functions/images/notify.png?authuser=0)

2. 在firebase對資料做處理，透過functions我們可以在內部做好資料的處理再送出結果，就像API一樣
![](https://firebase.google.com/docs/functions/images/sanitization.png?authuser=0)

3. 在雲端執行密集型任務，而不是在您的應用程序中
![](https://firebase.google.com/docs/functions/images/intensive.png?authuser=0)

4. 使用第三方函式庫API，像是一些金流串接、第三方登入，都可以透過functions達成
![](https://firebase.google.com/docs/functions/images/commit.png?authuser=0)

總而言之就是一句話，沒有辦不到的事情，但是我們要會使用才行(廢話

# 如何呼叫 Cloud Functions

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/trigger_xtndij.jpg)
簡單的說有每個firebase提供的功能都可以建立trigger，當事件發生自動會執行的意思！
也能透過HTTP來手動執行！

#### 其他

詳細想了解大家可以看官方文件
https://firebase.google.com/docs/functions/?authuser=0

接著我們試著自己建立一個Functions來呼叫看看吧！

# Cloud Functions 環境建立

在開始前，我們會用firebase tool去建立typescript的開發環境，如果尚未建立的朋友可以看[第七天](https://ithelp.ithome.com.tw/articles/10194219)的文章～

# 安裝
接著我們安裝functions的相依套件
`cd functions`
`npm i` //npm install 的縮寫

接著打開functions下面的package.json，筆者的電腦使用firebase預設產生的script會有以下錯誤

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/functions_lo9drm.jpg)

所以筆者把
```json
"build": "./node_modules/.bin/tslint -p tslint.json && ./node_modules/.bin/tsc",
```
改成

```json
"build": "tslint -p tslint.json && tsc",
```
筆者目前還不知道為何會有這樣的錯誤，如果有大大們知道在麻煩留言告訴筆者 >_< ，
因為改成這樣的話他會使用外部專案的tsline、tsc會掃描到外部的 nodemodule，筆者這部分不清楚如何解決 >_<，

# 建立第一個Functions
打開index.ts，建立一個簡單的http functions
```js
import * as functions from 'firebase-functions';

export const helloWorld = functions.https.onRequest((request, response) => {
  response.send('我們的第一個Function成功執行了!\n\n');
 });
```
最後我們可以在本機測試看看
```js
npm run serve
```
看到以下畫面代表我們在本機測試是成功的，我們可以ctrl+滑鼠左鍵點擊網址看看，就會在瀏覽器看到我們剛剛書寫的文字了！
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/functions2_jody61.jpg)


# 發佈到firebase
最後發布我們發佈到firebase測試看看
```js
firebase deploy --only functions
```

第一次建立會跑比較久，給他一點時間，接我們們會看到以下畫面，這代表我們發布成功了，並且有網址可以點擊，我們可以點點看！
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/functions3_d8poct.jpg)

這樣我們第一個Cloud Functions建立完成了！

# 在Angular中使用Cloud Function

我們剛剛寫的是HTTP的cloud functions，換句話說我們可以使用http來取得資料。

app.component.ts
```js

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private _auth: AuthService, private _http: HttpClient) {
    console.log('App working!');
    this._http.get('https://us-central1-my-firebase-first-app.cloudfunctions.net/helloWorld')
      .subscribe(RxViewer);
  }
}

```
接著看看console，我們會得到跨域的錯誤！
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/functions4_wip11d.jpg)
這個要怎麼解筆者今天還沒研究到，我們明天再做講解QQ，雖然是可以在functions裡面加沒錯，但是我想有更好的辦法，明天筆者研究看看再跟大家講解。

本日範例：https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day13_first_functions


# 本日小節
今天我們建立了一個簡單的Http cloud functions，並簡單使用angular Http Client取得了資料，也了解到了Firebase cloud functions的power之處，但是也有一些未解的問題，我們接著會針對cloud functions的各種方法做解說，今天筆者想在頁面上加上兩個route遇到很多問題QQ卡了許久~~如果有經驗的夥伴，求協助~
謝謝您的閱讀~


# 參考文章
https://www.youtube.com/watch?v=QP8sjZuOlFY
https://firebase.google.com/docs/functions/?authuser=0
