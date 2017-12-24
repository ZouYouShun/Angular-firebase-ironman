# [Angular Firebase 入門與實做] Day-02 Realtime Database - 讀取(Read)-1

> Be strong, believe in who you are; be strong, believe in what you fele.

## 讀取(Read)

在昨天我們已經知道如何取得list資料，
firebase取得資料有兩種方式list、object，分別是取得陣列、與物件

 我們先看程式碼
* ts
```ts
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
  item$: Observable<any>;
  constructor(private _db: AngularFireDatabase) {
    this.items$ = this._db.list('items').valueChanges();
    // 加入item$並且用object去取得items下面1的這個物件
    this.item$ = this._db.object('items/1').valueChanges();
  }
}
```
* html
```html
items:
{{items$ | async | json}}
item:
{{item$ | async | json}}
```
沒錯在firebase取得資料物件就是這麼簡單，資料可以用/階層式的取出來。

> 很簡單沒錯，但是好像多寫了不少程式，有更好的方式嗎？

---------
## 把所有取得資料的方式獨立出來，以便我們將來在抽換http時能更加獨立

* 在tsconfig.json加入baseUrl讓以後檔案連結會更漂亮
```json
    "lib": [
      "es2017",
      "dom"
    ],
    "baseUrl": "src",
    "paths": {
      "@env": ["environments/environment"],
      "@shared/*": ["app/shared/*"],
      "@core/*": ["app/core/*"],
      "@common/*": ["app/common/*"]
    }
```
* 加入之後可在程式碼中使用這樣的方式import，達到虛擬路徑的功能，讓我們的程式碼不會出現../../../../這類的情形
```
import { CoreModule } from '@core/core.module';
```
---------
* 建立core module 用來放未來核心APP使用的service、model
```
ng g m core
```
* 建立 base.http.service.ts所有的http連線都透過他來整理
```
ng g s core/service/base.http
```
在內部實做db資料的取得
```ts
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

// 建立一個config interface藉此來實做未來要傳的參數名稱型態
export interface BaseHttpConfig {
  isKey: boolean;
}
@Injectable()
export class BaseHttpService {

  constructor(private _db: AngularFireDatabase) { }

  // 重新時做取得object的方法，並且給config預設值為true，因為大多時候我們都需要key值
  object<T>(url: string, config: BaseHttpConfig = { isKey: true }): Observable<T> | Observable<any> {
    const req = this._db.object(url);
    return config.isKey ?
      req.snapshotChanges().map(action => ({ key: action.key, ...action.payload.val() })) :
      req.valueChanges();
  }

  // 重新時做取得list的方法，同樣給key為true
  list<T>(url: string, config: BaseHttpConfig = { isKey: true }): Observable<T> | Observable<any> {
    const req = this._db.list(url);
    return config.isKey ?
      req.snapshotChanges()
        .map(actions => actions.map(action => ({ key: action.key, ...action.payload.val() }))) :
      req.valueChanges();
  }
}
```
* 將BaseHttpService註冊在core module並加入core 注入的判斷，防止新加入專案的成員又在其他地方注入
```ts
import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';

import { BaseHttpService } from './service/base.http.service';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    BaseHttpService,
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(`CoreModule has already been loaded. Import Core modules in the AppModule only.`);
    }
    /// 可將這段拉出去建立一個ts檔案，未來需要指注入一次的module都可以使用
  }
}
```
* 為了讓資料顯示得更有感覺，建議匯入這個json檔案，我們會更清楚資料的樣貌
[雲端硬碟json下載](https://drive.google.com/open?id=1aYQJ6HUE7yl0UCYvjgvhXzk8XY9Zrmb8)

下載後點擊右上角匯入就可以把json匯入進來了

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672293/1513747923606_ozucud.jpg)

* 在app.component.ts測試是否正確連線
```ts
import { Component } from '@angular/core';
import { BaseHttpService } from '@core/service/base.http.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  items$: Observable<any[]>;
  item$: Observable<any>;
  constructor(private _http: BaseHttpService) {
    this.items$ = this._http.list('menus');
    this.item$ = this._http.object('menus/information');
  }
}
```
儲存!資料一樣顯示出來了，有沒有覺得更加優雅了呢？
> 有，但是JSON很醜，很難閱讀！

### 這邊推薦一個我自己開發時常用的看json的方式 
[angular2-prettyjson](https://github.com/matiboy/angular2-prettyjson)
它可以讓json在畫面上變得更加美觀就像這樣↓

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1513672293/1513748224037_pg1c55.jpg)

> 在安裝前，說一下我們專案功用的module、component、directive、pipe擺放的方式

## 建立 Shared Module
### 加入一個專案常用的shared方式，也就是前面我們有加入的app/shared路徑，為來有共用的內容我們都會放在這裡。

一樣用cli建立module `ng g m shared`

```ts
import { CommonModule, JsonPipe } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { PrettyJsonModule, SafeJsonPipe } from 'angular2-prettyjson';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
  ],
  exports: [
    PrettyJsonModule // 把prettyJsonModule export出來，這樣一來在外不就都能使用這個module了
  ]
})
export class SharedModule {
  // 加入forRoot，這裡未來會放一些只會在app.module建立的service，因為我們這個module會多次注入，如果你直接在上面寫providers(注入service)，會產生多個service實體，這不是我們要的，因此我們會把service包裝在forRoot方法中
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: SharedModule,
      providers: [
        // 放service
      ]
    };
  }
}
```
在app.module.ts注入sharedModule並且記得**forRoot()**

* 最後修改app.component.html
```html
items:
<prettyjson [obj]="items$ | async"></prettyjson>
item:
<prettyjson [obj]="item$ | async"></prettyjson>
```
你會發現json在畫面上變得很容易閱讀了，angular2-prettyjson它也是使用pipe來實做的，若大家有興趣可以去看它的原始碼，angular的pipe可以讓我們優雅的轉換顯示資料的樣貌，真的很好用。

# 本日小結
今天我們了解了專案初步建立的結構，並且時做了base.http.service來統整所有的http方法，還使用了prettyjson來讓我們在觀看json時更加便利，明天我們會更進一步介紹Realtime DB Read的其他power之處，今天是冬至！祝大家冬至吃湯圓愉快=ˇ=

# 參考文章
[Angular: Understanding Modules and Services](https://medium.com/@michelestieven/organizing-angular-applications-f0510761d65a)

[angular2-prettyjson](https://github.com/matiboy/angular2-prettyjson)

[version-5-upgrade](https://github.com/angular/angularfire2/blob/master/docs/version-5-upgrade.md)