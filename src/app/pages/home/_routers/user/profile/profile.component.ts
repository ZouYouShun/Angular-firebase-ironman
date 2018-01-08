import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { FileHandler, UploadService } from '@core/service/upload.service';
import { RxViewer } from '@shared/ts/rx.viewer';
import { FileError } from 'ngxf-uploader';
import { Observable } from 'rxjs/Observable';

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

  process: number[] = [];
  fileData: File;

  user$;

  constructor(private _upload: UploadService, private _auth: AuthService) {
    this.user$ = this._auth.currentUser$;
  }

  ngOnInit() {
    // this.file$ = this._upload.fileHandler('201711081351-rIXwT.jpg').get();
  }

  uploadFile(file: File | FileError): void {
    console.log(file);
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
}
