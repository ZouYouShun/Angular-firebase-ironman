# [Angular Firebase 入門與實做] Day-25 搜尋引擎優化SEO
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> Goals are not only absolutely necessary to motivate us. They are essential to really keep us alive. --我們不僅僅需要目標來保持前進的動力，我們需要有目標才能真正地活下去。

前端在SEO上在過去一直處於弱勢，但是有了SSR等等新技術的誕生，讓我們的PWA越來越有可能在SEO上不再弱勢，其中SSR就是一種方法，而SSR在Angular universal，就一定要談到Angular Universal。

# Anuglar universal

透過SSR我們可以將前端的畫面在後端繪製完成，送回前端，讓爬蟲完全不會有讀不到資料的問題，也能增強使用者的體驗，因為初始的HTML是有的！所以我們能加快使用者看到畫面的速度。

相信有在接觸Angular的朋友一定對它不陌生，而有實際用過的朋友一定又愛又恨，常常會遇到一些莫名的問題，更可怕的是每次也檢查問題就必須編譯，相當耗時，筆者常使用的是express的專案，並且已經有一套成功使用ssr搭配各種不同的套件的方式，但是在firebase上，筆者研究了兩天，還是遇到了許多問題，且目前筆者不知道如何解決。

由於已經卡了兩天，在functions上SSR實在仍有太多問題，筆者暫時放棄T_T，這邊把研究過程中看的文章做個分享與紀錄，若未來有成功實做，筆者在進行更新，
以下是相關比較有用的資料
https://www.youtube.com/watch?v=gxCu5TEmxXE
https://davidea.st/articles/the-beginners-guide-to-angular-universal
https://github.com/angular/angular-cli/blob/master/docs/documentation/stories/universal-rendering.md
https://medium.com/@cdeniz/angular-universal-on-firebase-dynamic-hosting-4fdd034af3db
https://hackernoon.com/deploy-angular-universal-w-firebase-ad70ea2413a1
https://ithelp.ithome.com.tw/articles/10195360
https://medium.com/@evertonrobertoauler/angular-4-universal-app-with-angular-cli-db8b53bba07d

雖然目前還是很有問題，我們今天就先把他拋在腦後，我們換個方法來做

榮重為大家介紹：

# Rendertron

https://render-tron.appspot.com/
https://github.com/GoogleChrome/rendertron

基本邏輯如下：
* 當機器人(爬蟲)來看網頁時，會透過Rendertron來執行前端給爬蟲看，所以看得到畫面！
* 當使用者來看的時候，直接使用前端給使用者看，不進Rendertron，讓使用者能快速看到畫面。

廢話不多說，我們先使用官方提供的[範例站台](https://render-tron.appspot.com/)來實做看看。

# 加入firebase functions

首先，先到我們Angular專案，修改一下firebase.json，rewrites要指向我們等等要設定的function`Rendertron`
```json
"hosting": {
  "public": "dist",
  "ignore": [
    "firebase.json",
    "**/.*",
    "**/node_modules/**"
  ],
  "rewrites": [{
    "source": "**",
    "function": "Rendertron" // 注意是function不是functions喔
  }]
},
```

打開functions專案
```bash
npm i node-fetch
npm i @types/node-fetch -D // 也把type裝起來
```
接著實做我們的`rendertronHttpTrigger`
```js
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as url from 'url';
// 注意fetch的注入方法是這樣的
import fetch from 'node-fetch';

const app = express();

// APP的網址
const appUrl = 'my-firebase-first-app.firebaseapp.com';
// rendertron的網址，我們先使用官方提供的示範網址
const renderUrl = 'https://render-tron.appspot.com';

function generateUrl(request) {
  return url.format({
    protocol: request.protocol,
    host: appUrl,
    pathname: request.originalUrl
  });
}

function detectBot(userAgent: string) {
  const bots = [
    'googlebot',
    'binbot',
    'yandexbot',
    'duckduckbot',
    'slurp',
    ...
  ];

  const agent = userAgent.toLocaleLowerCase();

  for (const bot of bots) {
    if (agent.indexOf(bot) > -1) {
      console.log('偵測到機器人', bot, agent);
      return true;
    }
  }
  console.log('不是機器人');
  return false;
}

app.get('*', (req: any, res) => {
  const isBot = detectBot(req.headers['user-agent']);
  if (isBot) {
    const botUrl = generateUrl(req);
    fetch(`${renderUrl}/${botUrl}`)
      .then(response => response.text())
      .then(body => {
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        res.set('Vary', 'User-Agent');
        res.send(body.toString());
      })
      .catch(err => res.status(401).json({
        err: err
      }));
  } else {
    fetch(`https://${appUrl}`)
      .then(response => response.text())
      .then(body => {
        res.send(body.toString());
      })
      .catch(err => res.status(401).json({
        err: err
      }));
  }
});

export const rendertronHttpTrigger = functions.https.onRequest(app);
```
當然`index.ts`也要加上
```js
export const Rendertron = rendertronHttpTrigger;
```

最後兩邊都部屬上去，測試看看!
https://cards-dev.twitter.com/validator
https://developers.facebook.com/tools/debug/

# 建立自己的Rendertron站台

我們除了使用官方的範例之外，我們也可以把rendertron clone下來到自己的專案內，自己管理自己的rendertron，並且提高效率。

### clone server
`git clone https://github.com/GoogleChrome/rendertron.git server`

建立docker container ，若未安裝[docker](https://docs.docker.com/engine/installation/#supported-platforms)的朋友可在這裡下載
```bash
docker build -t rendertron . --no-cache=true
```
接著我們去下載這個檔案下來，筆者將檔案放在server底下
https://raw.githubusercontent.com/jfrazelle/dotfiles/master/etc/docker/seccomp/chrome.json

執行命令啟動站台，如果有出現錯誤，請把chrome.js放到指定的位置
```bash
docker run --rm -it -p 8080:8080 --security-opt seccomp=C:/Users/Alan/Documents/MyProject/iron-man/2017iron-man/angular-firebase-ironman/server/chrome.json --name rendertron-container rendertron
```

接著我們打開http://localhost:8080/ 有看到畫面代表成功執行了，我們可以在本機試試看Take screenshot的功能，大概會花5~10秒內(官方表示10秒以內)，這代表我們的rendertron的環境算是完成了，簡單的說他就是一個站台，專門讓我們用來畫畫面，跟官方的一樣只是我們能自己修改，並自己管理。

注意要關掉docker的任務要下以下命令
```bash
docker rm -f $(docker ps -a -q)
```
另外如果不想每次都要下移除命令，我們可以在編譯時加上參數`--rm `
```bash
docker run --rm -it -p 8080:8080 --security-opt seccomp=C:/Users/Alan/Documents/MyProject/iron-man/2017iron-man/angular-firebase-ironman/server/chrome.json --name rendertron-container rendertron
```

接著我們部屬上去

# gcloud 部屬
由於我們是使用firebase，因此我們也就順便使用gcloud來部屬了
另外，這邊如果要使用必須要啟用雲端cloud的功能，當然你也可以選擇部屬到其他地方。

先下載gcloud的CLI，安裝登入
https://cloud.google.com/sdk/docs/
安裝好要重新開機，命令才會生效

注意要安裝[python2](https://www.python.org/downloads/)，若沒有安裝也要安裝!記得不要裝3版，要裝2版，目前gcloud並沒有支援python3，安裝完後要記得加入環境參數，然後重新開機生效，加入的方法可以參考這裡 https://ithelp.ithome.com.tw/articles/10156296。


```bash
gcloud app deploy app.yaml --project my-firebase-first-app
```
注意，如果你的資料夾有中文命名會出現編碼的錯誤，建議不要有任何中文的命名
詳情http://blog.csdn.net/a657941877/article/details/9063883
，很多類似的問題，筆者測試了許久，最後把中文命名移除就可以了。

接著打開它給我們的網址，你會看到我們的rendertron已經部屬上去了，
我們只要回頭把functions裡面的網址換掉就可以了，當然為了方便未來修改，我們能將網址搬移到config檔案中。
```js
export const CONFIG = {
    keyFilename: path.join(__dirname, 'keys', 'my-firebase-first-app-firebase-adminsdk-x3ito-c55a95c404.json'),
    appUrl: 'my-firebase-first-app.firebaseapp.com',
    renderUrl: 'https://render-tron.appspot.com'
};
```
最後在替換掉剛剛`rendertron.http.trigger`內部的網址即可。

# 本日小節
Rendertron真的是救星!雖然或許效能上比較慢了一些，但是針對爬蟲，很穩沒問題！!
解救了SSR很多奇奇怪怪的問題，關於詳細的解說大家可以看這裡，筆者很推薦大家去訂閱這個頻道
https://www.youtube.com/watch?v=ANyOZIcGvB8
講者的英文相當清楚，且分享的內容也都很給力!是非常優質的頻道！


# 參考資料
https://www.youtube.com/watch?v=ANyOZIcGvB8
https://blog.kevinyang.net/2017/12/25/angular-rendertron/
https://www.ccc.tc/notes/solving-seo-with-headless-chrome
