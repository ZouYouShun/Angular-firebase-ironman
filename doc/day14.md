# [Angular Firebase 入門與實做] Day-14 Cloud Functions HTTP Triggers

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> No matter what label is thrown you way, only you can define yourself.

今日成果： https://us-central1-my-firebase-first-app.cloudfunctions.net/helloWorld

昨天使用了cloud functions之後，如果你也是使用vscode，你會發現重新開啟vscode之後index會跑很久，然後最後失敗，筆者研究之後發現是因為functions資料夾中的node_module的關係，可能是有兩個node_module，vscode跑index炸掉了，所以今天我們要先把functions搬出去獨立一個資料夾。

由於我們也沒寫多少程式碼，我們不如直接重新init，順便再熟悉一次建立firebase functions的專案。

# 環境重設

`firebase init`
1. 選擇functions
2. 選擇typescript
3. 暫時不安裝
4. 修改package.json 
```json
"scripts": {
  "build": "tslint -p tslint.json && tsc",
  "build-w": "tslint -p tslint.json && tsc -w",
  "serve": "firebase serve --only functions",
  "shell": "npm run build && firebase experimental:functions:shell",
  "start": "npm run shell",
  "deploy": "firebase deploy --only functions",
  "logs": "firebase functions:log",
  "watch": "concurrently -k -p \"[{name}]\" -n \"TypeScript,Node\" -c \"yellow.bold,cyan.bold,green.bold\" \"npm run build-w\" \"npm run serve\""
}
```

其中的watch我們有使用concurrently讓我們能同時跑兩個任務在一個command，因此我們要裝一下
`npm i concurrently -D`裝在dev

接著我們就能執行看看`npm run watch`

# 修改index.ts

接著我們先解決昨天跨域的問題
根據[官方文件](https://firebase.google.com/docs/functions/http-events)、
https://stackoverflow.com/questions/42755131/enabling-cors-in-cloud-functions-for-firebase/42757033

我們可以使用express或是使用cors來解決跨域的問題 
`npm i cors`

# 使用cors解決跨域

然後在index.ts加入
```js
import * as functions from 'firebase-functions';
const cors = require('cors')({origin: true});

export const helloWorld = functions.https.onRequest((request, response) => {
    console.log("Hello from Firebase!");
    return cors(request, response, () => {
        return response.status(200).send({ test: 'Testing functions' });
    })
});
```

另外也能使用shell的方式來測試 => `npm start`

接著我們會看到以下畫面
```js
i  functions: Preparing to emulate functions.
Warning: You're using Node.js v8.9.1 but Google Cloud Functions only supports v6.11.5.
+  functions: helloWorld
firebase >
```
我們可以打指令來執行方法，例如helloWorld，我們可以打hellowWorld.get()

但是筆者不喜歡這樣測試，這樣無法用angular做測試不方便，所以我們還是使用`npm run watch`的方式來serve測試。

加上後再次使用angular做測試，我們把網址改成http://localhost:5000

我們可以在次測試把cors拿掉看看，你會發現又出現跨域錯誤了。

# 使用Express管理Route

另外我們也能使用Express來管理https，筆者習慣使用class做包裝，因此我們可以實做一個express的Server class

### ./model/server.model.ts
```js
import * as express from 'express';
import { apiRouter } from '../router/api.router';

export class Server {
    private app: express.Application = express();

    // 真正使用此app
    bootstrap() {
        return this.app;
    }
    constructor() {
        this.setConfig();
        this.setRouters();
    }
    // 設定環境
    private setConfig() {
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            next();
        });
    }
    // 設定路由
    private setRouters() {
        this.app
            .use('/', apiRouter);
    }
}
```
並且建立router資料夾，使用express的router做串接

```js
import * as express from 'express';
export const apiRouter = express.Router()
    .get('/', (req, res) => res.status(200).send({ test: 'get' }))
    .get('/:id', (req, res) => res.status(200).send({ test: 'get id' }))
    .post('/', (req, res) => res.status(200).send({ test: 'post' }))
    .put('/:id', (req, res) => res.status(200).send({ test: 'put id' }))
    .delete('/:id', (req, res) => res.status(200).send({ test: 'delete id' }))
```

最後在index.ts這麼使用
```js
import * as functions from 'firebase-functions';
import { Server } from './model/server.model';

export const helloWorld = functions.https.onRequest(new Server().bootstrap());
```

儲存!是不是很漂亮呢？在postMan或是瀏覽器測試功能，你會發現我們依樣可以跨域了，並且我們的helloWorld有了路由!有多種方法可以使用！

筆者會使用express的方式來操作，所以我們就把cors給移除了 `npm uninstall cors`

最後我們在次把方法deploy上去`npm run deploy`

然後再次使用APP測試看看這些API是否正常~

如果你的電腦也是裝8.X的版本，你會發現黨我們直接/helloWorld後面沒有斜線的時候在本機是可以的，但是在firebase是無法的，這可能是node版本導致，因此筆者建議前端在使用時最後都要加上斜線，會比較保險。

> 注意： 若你已經開啟serve狀態，在建立新的http trigger後必須重新執行watch，才會重新hosting API在本機

# Angular 開發網址切換小技巧

像我們剛剛做了切換網址的動作，而且每個http發送都需要加上網址，實在麻煩又不漂亮，我們可以使用httpClient interceptor的功能，來攔截發送的req做修改後在發送出去，以下實作：

api.interceptor.ts
```js
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor() { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // 把進來的網址都串上url
    return next.handle(
      req.clone({
        // 請在environment機上serverUrl的property，prod就放上線後的網址
        url: `${environment.serverUrl}/${req.url}/` 
      }));
  }
}
```

然後我們在core.module.ts的providers加上，之所以家在core是要避免其他有使用到httpClient取得資料的東西也被加上路徑(像是material的svg icon)
```js
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
],
```

最後我們component裡面就能這麼使用了
```js
this._http.get('/helloWorld').subscribe(RxViewer);
```

# 本日小節
今天透過cors、express解決跨域的問題，並且透過httpClient interceptor來修改網址，讓我們在http撰寫上更加方便，另外記得當未來正式上線後，`Access-Control-Allow-Origin`要修改回自己的系統網址，避免其他人隨意post攻擊站台。

### 本日範例：

Angular: https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day14_functions_route
functions: https://github.com/ZouYouShun/Angular-firebase-ironman-functions

# 參考文章
https://firebase.google.com/docs/functions/typescript
https://stackoverflow.com/questions/42755131/enabling-cors-in-cloud-functions-for-firebase/42757033
https://firebase.google.com/docs/functions/http-events
