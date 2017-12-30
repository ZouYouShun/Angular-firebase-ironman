# [Angular Firebase 入門與實做] Day-10 Storage 檔案處理

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> Celebrate what you've accomplished, but raise the bar a little higher each time you succeed.
	
# Storage

今天我們說一次怎麼把檔案存到firebase！這對任何系統來說都是必需的功能！

> storage的功能尚未正式釋出，但是在5.0.0-rc.5-next已經有該功能可以使用了

## 更新angularfire2
`npm i angularfire2@next`
**未來若正式釋出筆者會再更新**

筆者目前裝的版本為angularfire2@5.0.0-rc.5-next

# import AngularFireStorageModule

我們一樣加入StorageModule在AppModule，要注意不要打成AngularFire*Store*!!他們兩個有一點點像
```js
...
import { AngularFireStorageModule } from 'angularfire2/storage';
...
@NgModule({
  imports: [
    ...,
    AngularFireStorageModule,
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

## 在component測試使用

我們在app.component做測試

* ts

```js
...
import { AngularFireStorage } from 'angularfire2/storage';
...
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent  {

  constructor(private storage: AngularFireStorage) {
  }

  // 建立一個uploadFile的方法
  uploadFile(event) {
    const file: File = event.target.files[0];
    // 雲端所存放的檔案名稱
    // 檔名一樣的會就會覆蓋檔案
    const filePath = `${new Date().getTime()}_${file.name}`;
    
    //檔案上傳任務建立，注意這裡並不會真正的上傳，只是個任務而已！
    const task = this.storage.upload(filePath, file);

    // 當我們.then()之後才會真正進行上傳
    task.then()// 看這裡
      .then(() => {// 還有這裡~
        console.log('file upload success');
      });
  }
}
```

* html

```html
<input type="file" (change)="uploadFile($event)" />
```

* 注意事項
1. .then()或是其他方法之後才會建立實體並執行任務！
2. 兩次上傳檔案名稱若一樣，會直接覆蓋

## AngularFireUploadTask 任務相關方法

上傳任務實際如下：
```js
export interface AngularFireUploadTask {
    snapshotChanges(): Observable<storage.UploadTaskSnapshot | undefined>; // 檔案上傳相關資料流(類似store)
    percentageChanges(): Observable<number | undefined>; // 進度百分比
    downloadURL(): Observable<string | null>; // 下載的路徑，注意是observable，當檔案換位置，只要ID不變我們還是能找到檔案
    pause(): boolean; // 暫停上傳
    cancel(): boolean; // 取消上傳
    resume(): boolean; // 回復上傳
    then(): Promise<any>; // 開始上傳
    catch(onRejected: (a: Error) => any): Promise<any>; //上傳的錯誤訊息
}
```
相關功能如註解，值得注意的是，*只要有使用任何一個方法(cancel、pause除外)上傳任務就會被執行，並且上傳檔案！！！*
備註：如果依據使用並不會建立兩次，只會建立一次(上傳一次)。

我們這裡展示一下怎麼顯示檔案在頁面上，並且擁有暫停上傳、繼續上傳、取消上傳的功能

## 顯示檔案

ts
```js
  // 上傳任務本體
  uploadTask: AngularFireUploadTask;

  fileURL$: Observable<string>; // 檔案路徑
  uploadPercent$: Observable<number>; // 上傳進度
  meta$: Observable<any>; //相關資料

  ...
  uploadFile(event) {
    const file: File = event.target.files[0];
    const filePath = `${new Date().getTime()}_${file.name}`;
    this.uploadTask = this.storage.upload(filePath, file);

    this.uploadPercent$ = this.uploadTask.percentageChanges();
    this.fileURL$ = this.uploadTask.downloadURL();
    this.meta$ = this.uploadTask.snapshotChanges().map(d => d.metadata);
    this.uploadTask.then()// 看這裡
      .then(() => {// 還有這裡~
        console.log('file upload success');
      })
      .catch((err) => { console.log(err); });
  }

  // 暫停
  pause() {
    this.uploadTask.pause();
  }
  // 取消
  cancel() {
    this.uploadTask.cancel();
  }
  // 繼續
  resume() {
    this.uploadTask.resume();
  }
```

html
```js
<input type="file" (change)="uploadFile($event)" />
<ng-container *ngIf="uploadPercent$ | async as uploadPercent">
  <div>{{ uploadPercent }}</div>
  <button mat-raised-button (click)="pause()">暫停</button>
  <button mat-raised-button (click)="resume()">繼續</button>
  <button mat-raised-button (click)="cancel()">取消</button>
</ng-container>

<ng-container *ngIf="fileURL$ | async as imgUrl">
  <a [href]="imgUrl">{{ imgUrl }}</a>
  <img [src]="imgUrl" />
</ng-container>
<pre><code>{{ meta$ | async | json }}</code></pre>
```

> 就這麼簡單！!!!我們就能對檔案做上傳、暫停、繼續、取消了!!!!

覺得厲害!?還有更猛的QQ

## Custom metadata with File
我們可以針對檔案給予我們想設定的metadata!!!!
我們可以針對檔案給予我們想設定的metadata!!!!
我們可以針對檔案給予我們想設定的metadata!!!!(很重要說三次)

> 這意思是什麼!!!資料直接跟著檔案，我們再也不用害怕檔案刪除，但是資料因為某些原因沒有刪除的狀況了!!!

使用方法如下如下

我們可以在完成的時候去修改資料
```js
this.uploadTask.then()// 看這裡
  .then(() => {// 還有這裡~
    const ref = this.storage.ref(filePath);
    this.meta$ = ref.updateMetatdata({ customMetadata: { cool: 'very cool!!' } });
    console.log('file upload success');
  })
  .catch((err) => { console.log(err); });
```
再次上傳，你會發現metadata真的被我們取得了！!!

另外我們也可以直接連著資料一起上傳~
```js
const file = event.target.files[0];
const filePath = 'name-your-file-path-here';
const ref = this.storage.ref(filePath);
const task = ref.put(file, { customMetadata: { cool: 'very cool!!' } });
```
## 取得檔案

如果要直接取得檔案，也是使用ref的方式
```js
meta: Observable<any>;
constructor(private storage: AngularFireStorage) {
    const ref = this.storage.ref('dataUrl'); // 資料的路徑
    this.meta$ = ref.getMetadata(); // 詳細資料
    this.fileURL$$ = ref.downloadURL(); // 下載路徑
}
```

## 刪除檔案

如果要直接取得檔案，也是使用ref的方式
```js
meta: Observable<any>;
constructor(private storage: AngularFireStorage) {
    const ref = this.storage.ref('dataUrl');
    // 要subscribe才會真的執行刪除喔!
    ref.delete().subscribe(...)
}
```

## 修改檔案

如果要直接取得檔案，也是使用ref的方式
```js
meta: Observable<any>;
constructor(private storage: AngularFireStorage) {
    const ref = this.storage.ref('dataUrl');
    
    ref.put(file, { customMetadata: { cool: 'very cool!!' } });
}
```

本日範例：https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day10_firestorage

# 本日小節
firebase的檔案上傳可以說是相當的powerful！大家一定要試試看！雖然目前尚未正式release，但筆者使用的心得是沒有什麼問題，就是可能有部分API實做有點出入，有時是promise有時是Observable，這點要注意！不過是Typescript就還OK！會有錯誤訊息提醒我們=ˇ=

# 參考文章
https://github.com/davideast/angularfire2/blob/c4f8cae2df52d2db86b4488398974ceb5e8a3a05/docs/storage/storage.md
