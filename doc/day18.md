# [Angular Firebase 入門與實做] Day-18 Cloud Functions Cloud Storage Triggers 02 檔案上傳、拖曳檔案

每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> The first and greatest victory is to conquer yourself; to be conquered by yourself is of all things most shameful and vile. -- 戰勝自己是最首要、最偉大的勝利，無法克制自己是最令人羞愧、最可憐的失敗。

今天我們就來使用昨天寫的trigger來實做Angular看看，實做一個使用者自行上傳照片的功能

我們今天會使用[ngxf-uploader](https://github.com/ZouYouShun/ngxf-uploader)來實做檔案上傳的功能，
`npm i ngxf-uploader`
相關的API可以點網址過去觀看。

透過他我們可以簡單的出脫動檔案，上傳檔案的功能

首先加入module
```js
...
import { NgxfUploaderModule } from 'ngxf-uploader';

@NgModule({
  imports: [
    // 由於我們沒有要使用httpClient來上傳，我們使用firebase的方法，因此我們不使用他提供的service
    NgxfUploaderModule 
    ...
  ],
  declarations: [
    ...
  ]
})
export class UserModule { }
```

接著我們就能在component使用他的API了

```html
<button mat-raised-button color="primary" (click)="fileSelect.click()">
  上傳檔案
</button>

<div class="block"
     (ngxf-drop)="uploadFile($event)"
     drop-class="drop"
     accept="image/*,.svg" multiple>
  <label class="upload-button">
    choice file.
  </label>
</div>
<input type="file" #fileSelect
  (ngxf-select)="uploadFile($event)"
  [ngxf-validate]="{ size: { min: 50, max:1000000 } }"
  accept="image/*,.svg">
```
> 要注意如果有使用multiple的話她回傳的會是一個 File[]，在使用上要注意，accept在drop上也可以給

ts
```js
// 注入錯誤訊息的型別
import { FileError } from 'ngxf-uploader';
...

uploadFile(file: File | FileError): void {
  console.log(file);
  // 判斷是檔案還是錯誤訊息
  if (!(file instanceof File)) {
    this.alertError(file);
    return;
  }
  const filePath = `/users/${new Date().getTime()}_${file.name}`;
  this.fileHandler = this._upload.fileHandler(filePath);

  this.fileHandler.upload({ file: file })
    .subscribe(RxViewer);

  this.uploadPercent$ = this.fileHandler.task.percentageChanges();
  this.fileURL$ = this.fileHandler.task.downloadURL();
  this.meta$ = this.fileHandler.task.snapshotChanges().map(d => d.metadata);
}
  
```

我們可以加入這個判斷來知道透過ngxf-uploader獲得了什麼資訊
```js
alertError(msg: FileError) {
  switch (msg) {
    case FileError.NumError:
      alert('Number Error');
      break;
    case FileError.SizeError:
      alert('Size Error');
      break;
    case FileError.TypeError:
      alert('Type Error');
      break;
  }
}
```


# 本日小節
今天時間比較不足，後面再作補充>_< 今天使用ngxf-uploader來實做檔案上傳及拖曳上傳，簡單的實作並結合trigger實作縮圖，讓我們在顯示使用這圖片的時候可以使用小縮圖，降低使用者載入的速度。

# 參考文章
https://github.com/ZouYouShun/ngxf-uploader
https://ngxf-uploader.firebaseapp.com/upload
