# [Angular Firebase 入門與實做] Day-08 Authentication

# Authentication
firebase 的authentication功能，為我們的系統加入了登入的功能，並且透過他我們可以簡易的使用第三方登入，甚至他能使用電信用者登入、匿名登入、google、facebook、twitter、GitHub、Email等等，今天我們就針對最簡易的Email、google登入來實做登入功能。

# 啟用登入
我們點選*設定登入方式*
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/authentication_mxwyao.jpg)
會看到有以下的登入選項
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/authentication2_znp3iv.jpg)

# Email登入

將電子郵件/密碼啟用
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/authentication3_kt1gsv.jpg)

* 加入email Auth
回到Angular專案，確認我們的`app.module.ts`有把`AngularFireAuthModule`加入了，
```js
@NgModule({
  imports: [
    ...
    AngularFireAuthModule, // add auth module
    ...
  ],
  declarations: [
    AppComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```