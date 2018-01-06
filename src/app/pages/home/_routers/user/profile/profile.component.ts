import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { UploadService, FileHandler } from '@core/service/upload.service';
import { RxViewer } from '@shared/ts/rx.viewer';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  fileURL$: Observable<string>;
  uploadPercent$: Observable<number>;
  meta$: Observable<any>;

  fileHandler: FileHandler<{}>;

  file$;

  constructor(private _upload: UploadService) {
  }

  ngOnInit() {
    this.file$ = this._upload.fileHandler('201711081351-rIXwT.jpg').get();
  }

  uploadFile(event) {
    const file: File = event.target.files[0];
    const filePath = `/aaaa/${new Date().getTime()}_${file.name}`;
    this.fileHandler = this._upload.fileHandler(filePath);

    this.fileHandler.upload({ file: file, data: { test: '!!!!!!!!!!!!!!!' } }).subscribe(RxViewer);

    this.uploadPercent$ = this.fileHandler.task.percentageChanges();
    this.fileURL$ = this.fileHandler.task.downloadURL();
    this.meta$ = this.fileHandler.task.snapshotChanges().map(d => d.metadata);

    // setTimeout(() => {
    //   this.fileHandler.edit({ file: file, data: { cool: 'kkk' } }).subscribe(RxViewer);
    // }, 1000);

    // setTimeout(() => {
    //   this.fileHandler.delete().subscribe(RxViewer);
    // }, 2000);
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
}
