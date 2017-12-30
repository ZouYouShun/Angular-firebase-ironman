import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  uploadTask: AngularFireUploadTask;

  fileURL$: Observable<string>;
  uploadPercent$: Observable<number>;
  meta$: Observable<any>;

  constructor(private storage: AngularFireStorage) {
  }

  ngOnInit() {
  }

  uploadFile(event) {
    const file: File = event.target.files[0];
    const filePath = `${new Date().getTime()}_${file.name}`;
    this.uploadTask = this.storage.upload(filePath, file);

    this.uploadPercent$ = this.uploadTask.percentageChanges();
    this.fileURL$ = this.uploadTask.downloadURL();
    this.meta$ = this.uploadTask.snapshotChanges().map(d => d.metadata);
    this.uploadTask.then()// 看這裡
      .then(() => {// 還有這裡~


        const ref = this.storage.ref(filePath).delete().subscribe();
        // this.meta$ = ref.updateMetatdata({ customMetadata: { cool: 'very cool!!' } });

        console.log('file upload success');
      })
      .catch((err) => { console.log(err); });
  }

  pause() {
    this.uploadTask.pause();
  }

  cancel() {
    this.uploadTask.cancel();
  }

  resume() {
    this.uploadTask.resume();
  }

  customMetadata() {
  }
}
