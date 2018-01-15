# [Angular Firebase 入門與實做] Day-26 [實做] 照片功能修正與進階顯示
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> A new day will come. And when the sun shines, it will shine out the clearer... Folk in these stories had lots of chances of turning back, they kept going because they trust that's some good in this world. --嶄新的一天將會來臨，太陽也會散發出更明亮的光芒。這些故事中的主角，有很多機會半途而廢，但他們勇往直前，因為他們相信這是上一定存在著善良。--電影《指環王·雙塔奇兵》

今天我們針對之前[Day-19 Cloud Functions Cloud Storage Triggers 03 修正聊天室顯示功能](https://ithelp.ithome.com.tw/articles/10196526)顯示照片的功能做修正，並且建立一個聊天室的照片瀏覽牆功能。

## 今天目標
聊天室中顯示縮圖，當我們點擊時才顯示原圖，並修正縮圖的比例。

## 縮圖比例修正
縮圖產生的方法，我們在[day17](https://ithelp.ithome.com.tw/articles/10196177)透過store trigger產生了，
今天首先修正縮圖的比例，原本我們是固定200*200，今天我們要讓它是長或是寬看哪個大那個就固定200，另一個則依比例大小。

首先我們要取得圖片的大小這裡使用image-size來實做，並且我們一並安裝types
`npm install image-size`
`npm install @types/image-size -D`
以下實做
```js
import * as sizeOf from 'image-size';
...
...
// 我們在下載下來過後，對檔案做讀取然後處理
return bucket.file(filePath).download({
  destination: tempFilePath
}).then(() => {
  const img = sizeOf(tempFilePath);

  let width = img.width;
  let height = img.height;
  // 如果任何一的大於兩百才要做處理，不然就是用原圖就好
  if (width > 200 || height > 200) {
    const rate = img.height / img.width;

    // 高比較大，固定高
    if (rate > 1) {
      height = 200;
      width = 200 / rate;
    } else { // 寬比較大，固定寬
      width = 200;
      height = 200 * rate;
    }
  }
  // 下載完成後，我們執行spawn來呼叫Google Cloud提供的縮圖功能
  console.log('圖片下載完成，在', tempFilePath);
  return spawn('convert', [tempFilePath, '-thumbnail', `${width}x${height}`,
    tempFilePath])
```

接著我們deploy上去算是把大小做了修正，檔案不會再是固定正方形的，而是有比例的。


## 修正顯示方法
接著我們在顯示部分，要改成使用縮圖，所以我們要把原本使用storage路徑的方式修改成讀取document的方式。

首先先前我們用來顯示照片的方法如下
```html
<app-message-item-file *ngSwitchCase="'file'" [data]="roomFiles[message.content]"></app-message-item-file>
```
在TS的部分，我們是透過路徑直接存取到storage的檔案，取得路徑
```js
this.url$ = this._storage.ref(value.id).getDownloadURL().do(u => this.path = u);
```

我們先建立一個FileModel
```js
import { BaseModel } from '@core/model/base.model';

export interface FileModel extends BaseModel {
  path: string;
  contentType: string;
  url: string;
  thumbnail: string;
}
```

我們把它改成下面這樣，透過files的document來取得詳細資料
```js
export class MessageItemFileComponent {
@Input() set data(value) {
  if (value) {
    if (!this.url$) {
      this.url$ = this._http.document<FileModel>(`files/${value.id}`).get()
        // 這裡我們過濾只有得到檔案的時候
        .filter(f => !!f)
        //  有檔案我們就指定path為縮圖
        .do(f => this.path = f.thumbnail);
    }
  }
}

url$: Observable<FileModel>;
path = '';
constructor(private _http: BaseHttpService) { }
```
如此一來我們就能透過document的realtime的特性，取得相對應的檔案，並且圖片的大小也會依比例縮放。

# 聊天照片夾

關於整個聊天室的檔案，這個就比較簡單了，由於我們檔案都有撈好了，我們只要簡單用個gallery來顯示即可，這邊就不多做解釋，有興趣的朋友可以直接看原始碼。


# 本日小節
今天透過image-size取得檔案的尺寸，並修正了檔案的大小，最後透過document的realtime的特性來顯示縮圖，並且透過gallery來顯示圖片，可以說是讓使用者在使用上更加方便，也減少使用者的流量消耗。

# 本日原始碼
|名稱|網址|
|---|---|
|Angular| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day26_img_show_way|
|functions| https://github.com/ZouYouShun/Angular-firebase-ironman-functions/tree/day26_img_show_way|


# 參考資料
https://github.com/image-size/image-size
