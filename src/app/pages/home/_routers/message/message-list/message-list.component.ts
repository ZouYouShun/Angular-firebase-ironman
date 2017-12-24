import { Component, OnInit } from '@angular/core';
import { RxViewer } from '@shared/ts/rx.viewer';
import { Observable } from 'rxjs/Observable';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {
  messages$: Observable<any>;
  messagesHandler: CollectionHandler;

  constructor(private _http: BaseHttpService) { }

  ngOnInit() {
    this.messagesHandler = this._http.collection('messages');
    this.messages$ = this.messagesHandler.get({
      queryFn: ref => ref.orderBy('createdAt'),
      isKey: true
    });
  }

  send(value: string) {
    this.messagesHandler.add({ content: value }).subscribe(RxViewer);
  }

  delete(message: any) {
    this.messagesHandler.delete(message.id).subscribe(RxViewer);
  }

  updateItem(message: any, value?: string) {
    if (message.update) {
      this.messagesHandler.update(message.id, { content: value }).subscribe(RxViewer);
      message.update = false;
    }
    message.update = true;
  }

  deleteEverything() {
    // this.numbersHandler.drop().subscribe(rxHandler);
  }
}
