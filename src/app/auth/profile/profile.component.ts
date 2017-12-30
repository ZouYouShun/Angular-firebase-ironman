import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  profileUrl: Observable<string | null>;
  meta: Observable<any>;
  constructor(private storage: AngularFireStorage) {
    const ref = this.storage.ref('name-your-file-path-here');
    this.profileUrl = ref.getDownloadURL();
    this.meta = ref.getMetadata();
  }

  ngOnInit() {
  }

  uploadFile(event) {
    const file: File = event.target.files[0];
    const filePath = file.name;
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    this.downloadURL = task.downloadURL();
  }

  uploadFile2(event) {
    const file = event.target.files[0];
    const filePath = 'name-your-file-path-here';
    const ref = this.storage.ref(filePath);
    const task = ref.put(file, { customMetadata: { blah: 'blah' } });
  }
}
