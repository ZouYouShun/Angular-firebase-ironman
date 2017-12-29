import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/forkJoin';

import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';
import { RxViewer } from '@shared/ts/rx.viewer';
import { QueryFn, AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Message } from '@core/model/message';
import { AuthService } from '@core/service/auth.service';
import { User } from '@core/model/user.model';


@Component({
  selector: 'app-message-detial',
  templateUrl: './message-detial.component.html',
  styleUrls: ['./message-detial.component.scss']
})
export class MessageDetialComponent {

  messages$: Observable<any>;

  user: User;
  currentUser$;

  roomsHandler: CollectionHandler<any>;
  query = new BehaviorSubject<QueryFn>(ref => ref.orderBy('updatedAt'));
  myForm: FormGroup;
  lastMessages;

  constructor(
    private _http: BaseHttpService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private db: AngularFirestore,
    private auth: AuthService) {
    this.auth.currentUser$.subscribe(u => {
      this.user = u;
    });

    this.myForm = this.fb.group({
      content: ''
    });
    this.roomsHandler = this._http.collection('rooms');

    // this.messages$ = this.messagesHandler.get()
    //   .switchMap(list => Observable.forkJoin(
    //     list.map(item => this.messagesHandler.document(item.id).collection('messages').get().take(1))),
    //   (rooms, messages) => rooms.map((room, index) => {
    //     return {
    //       ...room,
    //       messages: messages[index]
    //     };
    //   }))
    //   .do((d) => console.log(d));
    // this._http.document<Message>(`messages/${params.id}`).get()
    // this.messagesHandler.document<Message>(params.id).get()
    this.messages$ =
      this._route.params
        .switchMap((params) => this.roomsHandler.document<Message>(params.id).get())
        .switchMap(item => {
          if (item) {
            return this.roomsHandler.document(item.id).collection('messages').get({
              isKey: false,
              queryFn: ref => ref.orderBy('createdAt')
            });
          }
          return Observable.of(null);
        });
  }

  add() {
    this.roomsHandler.set(this.user.uid, <any>{})
      .switchMap(doc => Observable.forkJoin([
        doc.collection('users').set(this.user.uid, {}),
        doc.collection('messages').add({
          uid: this.user.uid,
          content: this.myForm.value.content
        })
      ]))
      .subscribe(() => {
        console.log('success!');
      });
  }

  delete(message: any) {
    this.roomsHandler.delete(message.id).subscribe(RxViewer);
  }

  updateItem(message: any, value?: string) {
    if (message.update) {
      // this.messagesHandler.update(message.id, { content: value }).subscribe(RxViewer);
      message.update = false;
    }
    message.update = true;
  }
}
