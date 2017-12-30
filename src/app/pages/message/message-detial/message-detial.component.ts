import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Message } from '@core/model/message';
import { Room, UserRoom } from '@core/model/room.model';
import { User } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService, CollectionHandler, DocumentHandler } from '@core/service/base-http.service';
import { RxViewer } from '@shared/ts/rx.viewer';
import { AngularFirestore, QueryFn } from 'angularfire2/firestore';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-message-detial',
  templateUrl: './message-detial.component.html',
  styleUrls: ['./message-detial.component.scss']
})
export class MessageDetialComponent {

  messages$: Observable<any>;

  user: User;
  currentUser$;
  messageHandler: CollectionHandler<Message>;



  roomsHandler: CollectionHandler<Room>;
  userRoomsHandler: CollectionHandler<any>;
  query = new BehaviorSubject<QueryFn>(ref => ref.orderBy('updatedAt'));
  myForm: FormGroup;
  lastMessages;

  private roomId;
  private targetUserId;

  constructor(
    private _http: BaseHttpService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private db: AngularFirestore,
    private auth: AuthService) {
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
    this.messages$ = this.auth.currentUser$
      .filter(u => !!u)
      .switchMap(u => this._route.params, (u, params) => {
        console.log(u);
        this.user = u;
        this.targetUserId = params.id;
        return this._http.document(`users/${u.uid}`).collection('rooms').document<UserRoom>(this.targetUserId).get();
      })
      .switchMap(u => u)
      .switchMap(room => {
        if (room) {
          this.roomId = room.roomId;
          return this.roomsHandler.document<Message>(room.roomId).get();
        }

        return Observable.of(null);
      })
      .switchMap(item => {
        if (item) {
          this.messageHandler = this.roomsHandler.document(item.id).collection('messages');
          return this.messageHandler.get({
            isKey: false,
            queryFn: ref => ref.orderBy('createdAt')
          });
        }
        return Observable.of(null);
      });
  }

  add() {
    let req: Observable<any>;
    // 先寫房間ID
    if (this.roomId) {
      req = this.roomsHandler.set(this.roomId, <any>{}).switchMap(doc => {
        this.roomId = doc.id;
        return Observable.forkJoin([
          doc.collection('users').set(this.user.uid, {}),
          doc.collection('messages').add({
            uid: this.user.uid,
            content: this.myForm.value.content
          })]);
      }).switchMap(doc =>
        // 將房間ID寫回user的資料
        Observable.forkJoin([
          this._http.document(`users/${this.user.uid}`).collection('rooms').set(this.targetUserId, { roomId: this.roomId }),
          this._http.document(`users/${this.targetUserId}`).collection('rooms').set(this.user.uid, { roomId: this.roomId })
        ]));
    } else {
      req = this.messageHandler.add({
        uid: this.user.uid,
        content: this.myForm.value.content
      });
    }

    req.subscribe(() => {
      console.log('success!');
      this.myForm.reset();
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
