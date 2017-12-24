import 'rxjs/add/operator/take';

import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';
import { RxViewer } from '@shared/ts/rx.viewer';
import { QueryFn } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent {
  messages$: Observable<any>;
  messagesHandler: CollectionHandler;
  query = new BehaviorSubject<QueryFn>(ref => ref.orderBy('updatedAt'));
  myForm: FormGroup;

  constructor(private _http: BaseHttpService, private fb: FormBuilder) {

    this.myForm = this.fb.group({
      content: ''
    });

    this.messagesHandler = this._http.collection('messages');

    this.messages$ = this.query.switchMap(queryFn => {
      return this.messagesHandler.get({
        queryFn: queryFn,
        isKey: true
      });
    });
  }

  getAll(number) {
    if (number) {
      return this.query.next(ref => ref.orderBy('updatedAt', 'asc').limit(number));
    }
    this.query.next(ref => ref.orderBy('updatedAt', 'asc'));
  }

  multiOrder() {
    this.query.next(ref => ref.orderBy('content', 'asc').orderBy('updatedAt', 'desc'));
  }

  last(state: 'asc' | 'desc') {
    this.query.next(ref => ref.orderBy('updatedAt', state).limit(2));
  }

  select(id) {
    this.query.next(ref => ref.where(firebase.firestore.FieldPath.documentId(), '==', id));
  }

  handler(doc, type) {
    this.query.next(ref => ref.orderBy('updatedAt', 'asc')[type](doc.updatedAt));
  }

  add() {
    this.messagesHandler.add({ content: this.myForm.value.content }).subscribe(RxViewer);
    this.myForm.reset();
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
}
