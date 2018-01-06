# [Angular Firebase 入門與實做] Day-17 Cloud Functions Cloud Storage Triggers

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> There is nothing noble in being superior to some other man. the True nobility is in being superior to your previous self. -- 優於別人，並不高貴，真正的高貴應該是優於過去的自己 (海明威)

今日成果： https://onfirechat.ga/message


# Cloud Storage Triggers

透過Storage Trigger我們可以再有檔案變動的時候針對檔案做操作，讓我們可以讓APP的邏輯變得更簡單，檔案系統更加穩定。

## Storage物件

主要有以下兩種物件
| 名稱 | 說明 |
|--|--|
|functions.storage.object()| 當任何檔案有變動時會觸發該Trigger |
|functions.storage.bucket('bucketName').object()| 當我們有多個bucket(免費會員只能有一個)時，我們可以針對某一個bucket做監聽 |

## 實際監聽方法
呼叫.onChange方法，當資料有變動時自動會偵測到，如下：
```js
export const generateThumbnail = functions.storage.object()
  .onChange(event => {
    console.log('!!!!!!!!!!!!!圖片轉換被啟動了');
  });  
```

如此一來只要當檔案有變動的時候就會觸發事件了！

以下我們實做一個簡單的產生縮圖的方法：

1. 首先因為我們的檔案實際上是儲存在google cloud上的，因此我們要透過`@google-cloud/storage`來對檔案做處理，
並且我們透過`child-process-promise`來使用外部任務來執行google提供的縮圖[ImageMagick](https://www.imagemagick.org/script/index.php)功能製作縮圖 ，相關轉換的API可以看[這裡](https://www.imagemagick.org/script/convert.php)

```
npm i @google-cloud/storage child-process-promise @types/google-cloud__storage
```
因為我們使用TypeScript如果有Type我們當然要使用，可以到[這裡](https://microsoft.github.io/TypeSearch/)做查詢看有無Types，

> 要注意google-colud__storage有兩個_       不知道原因為何XD

2. 建立generateThumbnail.storage.ts檔案

import 相關內容
```js
import * as Storage from '@google-cloud/storage';
import * as cpp from 'child-process-promise';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as path from 'path';

import { storeTimeObject } from '../../libs/timestamp';

// 這是Storage的使用方法，
const gcs = Storage();
// 使用child-process-promise的spawn方法
const spawn = cpp.spawn;
```

# 建立方法
```js
// 當有任何檔案變動時觸發
export const generateThumbnail = functions.storage.object()
  .onChange(event => {
    console.log('!!!!!!!!!!!!!圖片轉換被啟動了');
    // 我們會把資料寫回資料庫，所以我們要使用admin.firestore建立files的Ref
    const filesRef = admin.firestore().collection('files');
```

Event的類型有以下可以使用
```js
export interface Event<T> {
    eventId?: string;
    timestamp?: string;
    eventType?: string;
    resource?: string;
    params?: {
        [option: string]: any;
    };
    data: T;
}
```

我們實際看一個檔案上傳的結果如下，其中data是我們需要用的物件：
```json
{
  "timestamp": "2018-01-06T08:20:29.775Z",
  "eventType": "providers/cloud.storage/eventTypes/object.change",
  "resource": "projects/_/buckets/my-firebase-first-app.appspot.com/objects/aaaa/1515226827500_14212676870_3b607cd325_o.jpg#1515226829775782",
  "data": {
    "kind": "storage#object",
    "resourceState": "exists", // 當前檔案的狀態 'exists' | 'not_exists'
    "id": "my-firebase-first-app.appspot.com/aaaa/1515226827500_14212676870_3b607cd325_o.jpg/1515226829775782",
    "selfLink": "https://www.googleapis.com/storage/v1/b/my-firebase-first-app.appspot.com/o/aaaa%2F1515226827500_14212676870_3b607cd325_o.jpg",
    "name": "aaaa/1515226827500_14212676870_3b607cd325_o.jpg", // 完整的檔案路徑，包含資料夾
    "bucket": "my-firebase-first-app.appspot.com",  //bucket name
    "generation": "1515226829775782",
    "metageneration": "1",
    "contentType": "image/jpeg", // 檔案類型
    "timeCreated": "2018-01-06T08:20:29.698Z", 
    "updated": "2018-01-06T08:20:29.698Z", 
    "storageClass": "STANDARD",
    "size": "1138883", // 檔案大小
    "md5Hash": "OTY4MTkwNTA5ZWZlOThlNGY2ODFkNWI2Zjg4ZjZlOTM=",
    "mediaLink": "https://www.googleapis.com/download/storage/v1/b/my-firebase-first-app.appspot.com/o/aaaa%2F1515226827500_14212676870_3b607cd325_o.jpg?generation=1515226829775782&alt=media",
    "contentDisposition": "inline; filename*=utf-8''1515226827500_14212676870_3b607cd325_o.jpg",
    "metadata": { // 我們設定的metadata，並且會包含一個download Token
      "test": "!!!!!!!!!!!!!!!",
      "firebaseStorageDownloadTokens": "820ecd33-d832-4012-a633-01d7d1478c7b"
    },
    "crc32c": "9/laHQ=="
  },
  "params": {}
}
```
了解了基本的物件後，我們繼續實做。

取得檔案的名子，與基本資料
```js
    const object = event.data;
    const metadata = object.metadata;
    const filePath = object.name;
    const encodePath = encodeURIComponent(filePath); // encodePath 用於存資料庫使用，資料庫不能存有/的路徑
    const fileName = path.basename(filePath);
```
判斷物件的狀態，如果是刪除任務我們就把資料一併刪除
```js
    if (object.resourceState === 'not_exists') {
      console.log('這是刪除事件');
      // 如果是刪除事件，把資料也刪掉
      return filesRef.doc(encodePath).delete()
        .catch(err => {
          console.log('資料不存在了!');
        });
    }
```
判斷檔案是否為圖片，我們只對圖案做處理
```js
    if (!object.contentType.startsWith('image/')) {
      console.log('這不是圖片')
      return false;
    }
```
取得檔案相關參數
```js
    const fileBucket = object.bucket
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = path.join('/tmp', fileName);
```
設定縮圖檔案的位置，這裡使用正規表示式，有了解詳細的朋友可以看[這裡](https://regexr.com/)，產生的結果會式`thumb_{原檔名}`
```js
    const thumbFilePath = filePath.replace(/(\/)?([^\/]*)$/, '$1thumb_$2');
```

## 開始實做縮圖製作

我們的邏輯是這樣的：
1. 下載檔案到雲端server
2. 製作縮圖
3. 上傳新的縮圖
4. 寫回資料庫

```js
    // 下載原檔
    return bucket.file(filePath).download({
      destination: tempFilePath
    })
    .then(() => {
      // 下載完成後，我們執行spawn來呼叫Google Cloud提供的縮圖功能
      console.log('圖片下載完成，在', tempFilePath);
      return spawn('convert', [tempFilePath, '-thumbnail', '200x200',
        tempFilePath])
    }).then(() => {
      // 縮圖產生完成後，把縮圖透過bucket上傳到storage
      console.log('縮圖產生完成');

      return bucket.upload(tempFilePath, {
        destination: thumbFilePath
      });
    }).then(() => {
      const config = {
        action: 'read',
        // expires: '08-03-2491' // I don't want to expire
      }
      // get files download url
      return Promise.all([
        bucket.file(thumbFilePath).getSignedUrl(config),
        bucket.file(filePath).getSignedUrl(config)
      ])
    }).then(([thumbResult, originalResult]) => {
      const url = originalResult[0]; // 注意這裡回傳的是陣列
      const thumbnail = thumbResult[0]; // 注意這裡回傳的是陣列
      return filesRef.doc(encodePath)
        .set(storeTimeObject({
          path: filePath,
          contentType: object.contentType,
          creator: metadata.creator || 'system',
          updater: metadata.updater || 'system',
          url,
          thumbnail,
        }));
    }).catch((err) => {
      console.error(err);
    });
  });
```

到這裡我們算是實做完成了，但是有兩個問題
1. 我們上傳的縮圖會再次觸發這個方法，然後又再做一次縮圖，然後無限迴圈
2. 我們的getSignedUrl會因為權限而有問題

我們依序解決

## 無限迴圈的問題
1. 我們在上傳縮圖的時候，幫他加上一個屬性complete，用以判斷檔案是否建立完成
```js
return bucket.upload(tempFilePath, {
  destination: thumbFilePath,
  metadata: { // 這裡要注意，我們的metadata
    metadata: { // customMetada放這裡
      complete: true // 我們新增一個complete的屬性
    }
  }
});
```
2. 我們在檢查是否為圖片後加上這一段
```js
if (metadata.complete) {
  console.log('這個檔案已經處理完成')
  return false;
}
```
如此一來我們就知道這個檔案是完成的了，不需要繼續產生縮圖

## url無法取得的問題
關於這個問題是權限的問題，我們到管理中心的地方，依序操作

* 點擊專案設定
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515231051/%E6%AC%8A%E9%99%90%E7%AE%A1%E7%90%86%E8%A8%AD%E5%AE%9A_hc3q0b.jpg)
* 點擊服務帳戶的頁簽接著點取得金鑰匙
![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515231051/%E5%8F%96%E5%BE%97%E9%87%91%E9%91%B0_yrpaea.jpg)

他會下載一個json檔案下來，我們把它放到專案資料夾裡面，
筆者是這麼放的

![](https://res.cloudinary.com/dw7ecdxlp/image/upload/v1515234459/%E8%B3%87%E6%96%99%E5%A4%BE_yznhws.jpg)

並且在src目錄底下建立一個config用來擺放先關的參數，檔案內容如下
```js
import * as path from 'path';

export const CONFIG = {
    keyFilename: path.join(__dirname, 'keys', 'key檔案位置')
};
```

最後修改剛剛加入`Storage`的時候後面的參數
```js
// 加上KeyFilename，把金鑰匙的位置給他
const gcs = Storage({ keyFilename: CONFIG.keyFilename });
const spawn = cpp.spawn;
```

加上後就能賦予取得網址的權限了。

最後在index.ts加上剛剛撰寫的方法
```js
export const Trigger_generateThumbnail = generateThumbnail;
```

# Deploy

在deploy前，因為我們是使用typescript來實做，而deploy並不會把這個keys資料夾複製過去，所以我們還要修改一下，

#### 自己時做檔案複製功能
筆者翻閱了一下firebase的functions的設定檔的config看來是沒有讓我們能複製檔案的功能，不過複製檔案也很簡單，我們就自己實做即可。

我們會使用到`ncp`來做深度的檔案複製，
`npm install ncp`

在根目錄底下建立一個`move.file.ts`，
有興趣的朋友可以看我下面的code，不然也可以直接複製去使用即可，
基本上就是做簡單的檔案複製而已。
```js
import * as path from 'path';
import * as ncp from 'ncp';

const moveUrl = [
  '/src/keys'
];

const destinationUrl = 'lib';

export class MoveFile {
  fromUrl = 'dist/index.js';

  constructor() {
    this.movefile();
  }

  movefile() {
    moveUrl.forEach((url) => {
      console.log(`copy "${path.join(url)}" => "${path.join(destinationUrl, url)}" ...`)
      ncp(path.join(__dirname, url), path.join(__dirname, destinationUrl, path.basename(url)), function (err) {
        if (err) {
          console.error('Move fail');
          console.error(err);
          return false;
        }
        console.error('Move success');
      });
    });
    console.log('Move Done!');
  }
}
module.exports = new MoveFile();
```
接著使用tsc編譯這個檔案
`tsc move.file.ts`

再來在package.json加上deploy前的參數，我們在tsc後面要執行我們自己的move.file方法
```json
"scripts": {
  "build": "rimraf lib && tslint -p tslint.json && tsc && node move.file",
  ...
}
```

接著就可以deploy試試看了！
`npm run deploy`

我們打開firebase的管理介面

在Storage的地方上傳檔案，上傳後重新整理一下畫面(firebase的介面不會自己更新functions產生的檔案)，會發現縮圖已經產生了，這時我們再到database的firestore會發現資料也被建立了！

接著我們一樣到檔案介面把檔案刪除，會發現我們的資料也會被一併刪除了~

筆者建議大家在刪除上可以使用資料刪除的trigger就好，因為刪除檔案的行為我們通常會事先刪除資料再去刪除檔案的，這裡只是做一下展示。

當然如果你想兩邊都寫也是沒問題的，只是要注意判斷不要讓他們無限迴圈了~

# 本日原始碼
|名稱|網址|
|---|---|
|Angular|https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day16_functions_firestore|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day16_functions_firestore|

# 本日小節
今天我們介紹了firestore 的 trigger，可以說是相當方便，讓我們可以大幅的減少我們在client的邏輯，並且透過他我們就算是直接在firebase的管理中心修改內容也是可以觸發的，大大提升了我們系統的穩定，舉例來說，當我們想刪除room時，我們只需透過刪除主要的room其餘的動作都透trigger來執行，就能做到把資料刪除乾淨的行為，client可以保持邏輯清晰，可說是很不錯，但是就是在開發上還是很多不便利，本機雖然可以透過shell的方式做到基本的測試，但是依舊無法像在雲端一樣的直接操作資料庫，希望未來我們可能可以透過firebase提供的工具來連線到雲端做本地端的操作，不然每次都要deploy實在是相當不方便。


對於入門來說，筆者很推薦大家看這個系列的影片，雖然是英文的但是說得很清楚，英文也很好聽(老師也很美XD
https://www.youtube.com/watch?v=EvV9Vk9iOCQ&list=PLl-K7zZEsYLkPZHe41m4jfAxUi0JjLgSM

# 參考文章
https://firebase.google.com/docs/functions/firestore-events?authuser=0
https://firebase.google.com/docs/reference/admin/node/admin.firestore.FieldValue?authuser=0
