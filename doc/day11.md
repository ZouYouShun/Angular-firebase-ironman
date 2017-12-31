# [Angular Firebase 入門與實做] Day-11 Storage 檔案處理 02

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> The greatest glory in living lies not in never falling, but in rising every time we fall.

昨天我們對Storage有了基本的認識，今天我們進一步透過service來封裝

`ng g s core/service/upload.service/upload`

並再upload.service資料夾，建立一個index.ts
並且export內容
```js
export * from './upload.service';
```

之所以這樣建立，是為了我們將來在使用上可以這麼使用
```js
import { UploadService } from '@core/service/upload.service';
```
感覺就像是使用一個service單一檔案一樣，但是其實我們是放在不同的檔案中的，算是一個**小技巧**~


接著我們也像在使用collection封裝時一樣，實做UploadService
```js
@Injectable()
export class UploadService {

  constructor(private _storage: AngularFireStorage) { }

  fileHandler<T>(path: string) {
    return new FileHandler<T>(this._storage, path);
  }
}
```
建立一個fileHandler方法，並回傳一個FileHandler物件，我們這邊也可以使用泛型`<T>`來定義我們這個檔案物件的metadata。

接著時做FileHandler
```js
import 'rxjs/add/observable/fromPromise';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';

export class FileHandler<T> {
  path: string;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;

  constructor(_storage: AngularFireStorage, filePath: string) {
    this.path = filePath;
    this.ref = _storage.ref(filePath);
  }

  // 我們使用obj包裝起來，並且用Observable包裝
  upload(obj: { file: File, data?: T }): Observable<firebase.storage.UploadTaskSnapshot> {
    // 把當前的任務存下來，我們可以在外部對他操作(暫停、繼續、取消)
    this.task = obj.data ?
      this.ref.put(obj.file, { customMetadata: <any>obj.data }) :
      this.ref.put(obj.file);
    return Observable.fromPromise(this.task.then());
  }

  // 如果有傳新的檔案，我們直接使用upload
  edit(obj: { file?: File, data: T }) {
    if (obj.file) {
      return this.upload({ file: obj.file, data: obj.data });
    }
    return this.ref.updateMetatdata({ customMetadata: <any>obj.data });
  }

  // 把原路徑回傳
  delete() {
    return this.ref.delete().map(() => this.path);
  }
}
```
並且將UploadService加入在core的`providers`中，

最後在要使用的component，把昨天的upload修改成這樣
```js
  ...
  // 建立一個變數存我們的Handler
  fileHandler: FileHandler<{}>;
  //注入我們的UploadService
  constructor(private _upload: UploadService) {
  }
  ...
  uploadFile(event) {
    const file: File = event.target.files[0];
    const filePath = `${new Date().getTime()}_${file.name}`;
    this.fileHandler = this._upload.fileHandler(filePath);

    this.fileHandler.upload({ file: file }).subscribe(RxViewer);

    this.uploadPercent$ = this.fileHandler.task.percentageChanges();
    this.fileURL$ = this.fileHandler.task.downloadURL();
    this.meta$ = this.fileHandler.task.snapshotChanges().map(d => d.metadata);
  }

  pause() {
    this.fileHandler.task.pause();
  }

  cancel() {
    this.fileHandler.task.cancel();
  }

  resume() {
    this.fileHandler.task.resume();
  }

  delete() {
    this.fileHandler.delete().subscribe(RxViewer);
  }
```
如此一來我們就能做到與昨天一樣的檔案上傳了！只是多了一層封裝，我們可以在封裝內做我們想做的事情，
像是組物件、加上上傳動畫等等，並且可以避免當API修改時我們要改很多地方的冏況。

# 使用pipe取得圖片
最後我們展示一下怎麼使用pipe取得圖片，

因為是共用的pipe，在其他模組可能也會使用因此，我們建立在shared.module

實做如下
```js
import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

@Pipe({
  name: 'img'
})
export class ImgPipe implements PipeTransform {
  constructor(private _storage: AngularFireStorage) { }

  transform(path: string): any {
    // 我們直接回傳該檔案的路徑的Observable
    return this._storage.ref(path).getDownloadURL()
      .catch((err) => {
        // 這裡可以放預設圖，可以將變數抽到environment中
        return Observable.of('assets/img/avatar.jpg');
      });
  }
}
```
然後注入在shared.module.ts的

```js
  declarations: [
    ...
    ImgPipe
  ],
```

最後在HTML使用

```html
<img *ngIf="'1514711588087_測試圖a.jpg' | img | async as img" [src]="img" />
```
如此我們就能簡單的對檔案路徑做顯示了！既優雅又好用！


本日範例：https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day11_firestorage_2

# 本日小節
今天封裝了firestore，讓我們能抽象的使用fireStorage，更容易操作，並且避免未來當api改變的時候我們會修改很多地方，這是筆者習慣的方式，大家如果覺得有那裡更好的地方可以提出，一起討論！

今天是第11天啦~~接下來會進入functions的重頭戲，並且針對資料做相關的身分認證、存取，今天是2017的最後一天，祝大家新年快樂！新的一年大家都能能量滿滿迎接挑戰！也希望筆者的文章能有幫助到各位！祝大家都能成為更好的人！

# 新年快樂
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)
![](https://ithelp.ithome.com.tw/images/emoticon/emoticon57.gif)

# 參考文章
https://codecraft.tv/courses/angular/pipes/async-pipe/
https://firebase.google.com/docs/storage/web/handle-errors?authuser=1
