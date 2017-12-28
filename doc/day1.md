# [Angular Firebase 入門與實做] Day-01 開發環境建立與初始化

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> Progress is impossible without change, and those who cannot chanage their minds connot change anything.

### 本日目標
建立新的**firebase專案**
建立**angularfire2搭配angular初始專案**。

## 建立Firebase專案

### 登入[firebase](https://firebase.google.com/)

登入Google帳號點擊GET STARTED

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672293/%E9%96%8B%E5%A7%8B_xqthz6.jpg)

輸入名子，選擇地點，建立專案，稍後一下~

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672529/%E5%BB%BA%E7%AB%8B_exoqbd.jpg)

選擇網路應用程式

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672638/%E9%81%B8%E6%93%87%E7%B6%B2%E8%B7%AF%E6%87%89%E7%94%A8%E7%A8%8B%E5%BC%8F_a7jz2k.jpg)

取得你的config資料

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672755/1513672722528_o0rbea.jpg)

這些config資料是等等我們要使用在app之中的，每個專案會有自己的相對應config。

## 建立angularfire2搭配angular初始專案
* 使用[Angular-cli](https://github.com/angular/angular-cli)建立專案，如果未安裝CLI， `npm install -g @angular/cli`

* 我們建立專案並且讓它內建routing，並且忽略初始install
```
ng new my-firebase-first-app --routing --skip-install
```
* 使用vscode打開專案
```
cd my-firebase-first-app
code .
```
* 使用[npm-check-updates](https://www.npmjs.com/package/npm-check-updates)先將所有套件一併更新，
`npm i -g npm-check-updates` 這個package相當好用，可以幫我們更新dependencies，很推薦安裝

筆者習慣會在package.json加入以下script
```json
  "scripts": {
    "preclean": "rimraf package-lock.json node_modules",
    "cleanAndUpdate": "ncu -a && ncu -d -a && npm install",
    "ng": "ng",
    "start": "ng serve -o",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
```
接著運行 ```npm run cleanAndUpdate```讓所有package都是最新的。

* 安裝firebase angularfire2
```
npm install firebase@4.8.0 angularfire2 --save
```
**請一定要裝firebase@4.8.0，因為4.8.1有大改版，但是angularfire2尚未跟進，待改版後再做升級。**

* 另外筆者習慣使用scss，所以在.angular-cli.json把defaults的css改為scss，
* 並將所有檔案的測試設定為false，因為這裡沒有要使用測試，以後要使用在建立即可，筆者不喜歡看到多餘的檔案(潔癖很嚴重XD。

未來如果想加入測試，可以寫一個小程式去產生即可，檔案都是有類似邏輯的，不需手動建立，筆者這邊因為不會使用到測試所以才將其移除，若大家一開始就有導入測試，或是想省去未來加入時的麻煩，可以保留。

這邊提供一套筆者自己寫產生spec的CLI，如果有需求可以用用看[angular-spec-generator](https://www.npmjs.com/package/angular-spec-generator)
`npm install -g angular-spec-generator`

```json
  "defaults": {
    "styleExt": "scss",
    "class": {
      "spec": false
    },
    "component": {
      "spec": false
    },
    "directive": {
      "spec": false
    },
    "guard": {
      "spec": false
    },
    "module": {
      "spec": false
    },
    "pipe": {
      "spec": false
    },
    "service": {
      "spec": false
    }
  }
```

* 筆者的package.json的版號
```json
"dependencies": {
    "@angular/animations": "^5.1.1",
    "@angular/common": "^5.1.1",
    "@angular/compiler": "^5.1.1",
    "@angular/core": "^5.1.1",
    "@angular/forms": "^5.1.1",
    "@angular/http": "^5.1.1",
    "@angular/platform-browser": "^5.1.1",
    "@angular/platform-browser-dynamic": "^5.1.1",
    "@angular/router": "^5.1.1",
    "angular2-prettyjson": "^2.0.6",
    "angularfire2": "^5.0.0-rc.4",
    "core-js": "^2.5.3",
    "firebase": "^4.8.0",
    "rxjs": "^5.5.5",
    "zone.js": "^0.8.18"
  },
  "devDependencies": {
    "@angular/cli": "1.6.1",
    "@angular/compiler-cli": "^5.1.1",
    "@angular/language-service": "^5.1.1",
    "@types/jasmine": "~2.8.2",
    "@types/jasminewd2": "~2.0.3",
    "@types/node": "~8.5.1",
    "codelyzer": "^4.0.2",
    "jasmine-core": "~2.8.0",
    "jasmine-spec-reporter": "~4.2.1",
    "karma": "~1.7.1",
    "karma-chrome-launcher": "~2.2.0",
    "karma-cli": "~1.0.1",
    "karma-coverage-istanbul-reporter": "^1.3.0",
    "karma-jasmine": "~1.1.1",
    "karma-jasmine-html-reporter": "^0.2.2",
    "protractor": "~5.2.2",
    "ts-node": "~4.0.2",
    "tslint": "~5.8.0",
    "typescript": "^2.6.1"
  }
```


修改完建議關掉vscode重新開啟，讓vscode重新跑索引。

* 重新開啟後，測試APP是否可成功啟用
`npm start`，因為剛剛有在start 加上-o所以會自動開啟在瀏覽器，方便偵錯，看到以下畫面代表初始成功，你的APP已經正常運行了。
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513673821062_csxnpq.jpg)
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513673954748_naezpj.jpg)

看到這個畫面，你的第一個Angular APP就建立完成了！![/images/emoticon/emoticon07.gif](/images/emoticon/emoticon07.gif)

# 在專案加入angularfire2並連線到firebase

* 將剛剛取得的config加入到environment之中
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513674224142_prtsat)
* 在app.module.ts把AngularFireModule import進來
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '@env';
// 因筆者會使用到以下四個module，若只有要使用部分功能，安裝相對應的module即可
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase), // init
    AngularFireDatabaseModule, // add realtime DB module
    AngularFirestoreModule, // add cloudstore DB module
    AngularFireAuthModule, // add auth module
    AppRoutingModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
儲存後！看看瀏覽器，你會發現瀏覽器自動更新了！這是CLI提供的功能，我們不需重新整理瀏覽器。

> 看看有沒有錯誤訊息！若沒有恭喜你成功注入了！
> 沒有感覺？那我們試試看不可以取得資料！

# 測試連線是否成功

* 先到firebase建立測試資料，點擊Database，選擇Realtime Database，建立一個item
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513694274165_jcck0v.jpg)

* 並點擊**規則**暫時把讀寫權限設定為true，方便我們開發時存取資料 **(注意：正式上線一定要視情況來做修正，不然任何人都可以存取你的資料)**
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513828363322_uuz7dx.jpg)

* 在app.component.ts加入取得資料的方法，注入AngularFireDatabase
```typescript
import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  items$: Observable<any[]>;
  constructor(private _db: AngularFireDatabase) {
    this.items$ = this._db.list('items').valueChanges();
  }
}
```
* 在app.component.html
```html
  <!-- async 是Angular提供的pipe，可以用來訂閱Observable，當Destroy時會自動unsubscribe，json也是另一種pipe，可以把物件轉成json顯示出來 -->
{{items$ | async | json}} 
```
# 本日小結
 今天我們有了初步的資料庫連線了，你可以試試看在管理介面修改資料內容，你會發現在我們的APP內部會自動更新喔！有感覺到Realtime DB的厲害了嗎*_*

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/1513739844891_dt9huv.gif)
# 參考文章
[angularfire2](https://github.com/angular/angularfire2/blob/master/docs/install-and-setup.md)
