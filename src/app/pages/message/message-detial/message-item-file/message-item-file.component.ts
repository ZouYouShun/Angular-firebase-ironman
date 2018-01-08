import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-message-item-file',
  templateUrl: './message-item-file.component.html',
  styleUrls: ['./message-item-file.component.scss']
})
export class MessageItemFileComponent {
  @Input() set data(value) {
    if (value) {
      if (!this.url$) {
        this.url$ = this._storage.ref(value.id).getDownloadURL().do(u => this.path = u);
      }
    }
  }

  url$: Observable<string>;
  path = '';
  constructor(private _storage: AngularFireStorage) { }

}
