import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BaseHttpService } from '@core/service/base-http.service';
import { FileModel } from '@core/model/file.model';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-message-item-file',
  templateUrl: './message-item-file.component.html',
  styleUrls: ['./message-item-file.component.scss']
})
export class MessageItemFileComponent {
  @Input() set data(value) {
    if (value) {
      if (!this.url$) {
        this.url$ = this._http.document<FileModel>(`files/${value.id}`).get().pipe(
          filter(f => !!f),
          tap(f => this.path = f.thumbnail)
        );
      }
    }
  }

  url$: Observable<FileModel>;
  path = '';
  constructor(private _http: BaseHttpService) { }

}
