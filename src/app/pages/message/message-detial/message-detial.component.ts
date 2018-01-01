import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Message } from '@core/model/message';
import { Room, UserRoom } from '@core/model/room.model';
import { User } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { RxViewer } from '@shared/ts/rx.viewer';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-message-detial',
  templateUrl: './message-detial.component.html',
  styleUrls: ['./message-detial.component.scss']
})
export class MessageDetialComponent extends AutoDestroy {

  @ViewChild('article', { read: ElementRef }) article: ElementRef;

  messages: Message[];
  messageForm: FormGroup;
  sender: User;
  addressee: User;

  private roomsHandler: CollectionHandler<Room>;
  private messageHandler: CollectionHandler<Message>;

  constructor(
    private _http: BaseHttpService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _auth: AuthService) {
    super();
    this.messageForm = this.fb.group({
      content: ''
    });
    this.roomsHandler = this._http.collection('rooms');

    this._route.params
      .combineLatest(this._auth.currentUser$.filter(u => !!u))
      .switchMap(([addressee, sender]) => {
        this.init();

        this.sender = sender;

        return this._http.document<User>(`users/${addressee.id}`).get();
      })
      .switchMap(addressee => {
        this.addressee = addressee;
        // 取得送出者對應收件者的聊天室資料
        return this._http.document(`users/${this.sender.uid}`)
          .collection('rooms')
          .document<UserRoom>(this.addressee.uid).get();
      })
      .switchMap(usersRoom => {
        // 取得房間內容
        if (usersRoom) {
          return this.roomsHandler.document<Message>(usersRoom.roomId).get();
        }

        return Observable.of(null);
      })
      .switchMap(room => {
        if (room) {
          this.messageHandler = this.roomsHandler.document(room.id).collection('messages');
          return this.messageHandler.get({
            isKey: false,
            queryFn: ref => ref.orderBy('createdAt')
          });
        }
        return Observable.of(null);
      })
      .takeUntil(this._destroy$)
      .subscribe(messages => {
        this.messages = messages;
        this.scrollButtom();
      });
  }

  @runAfterTimeout()
  private scrollButtom() {
    this.article.nativeElement.scroll({ top: this.article.nativeElement.scrollHeight, left: 0 });
  }

  private init() {
    this.messages = [];
    this.messageHandler = null;
    this.sender = null;
    this.addressee = null;
  }

  submitMessage() {
    const content = this.messageForm.value.content;
    if (!content) {
      return;
    }
    let req: Observable<any>;
    this.messageForm.reset();
    // 先寫房間ID
    if (this.messageHandler) {
      req = this.messageHandler.add({
        uid: this.sender.uid,
        content: content
      });
    } else {
      req = this.roomsHandler.add(<any>{}).switchMap(room => {
        return Observable.forkJoin([
          // 寫訊息
          room.collection('messages').add({
            uid: this.sender.uid,
            content: content
          }),
          // 寫房間的使用者
          room.collection('users').set(this.sender.uid, {}),
          room.collection('users').set(this.addressee.uid, {}),
          // 寫使用者的房間對應的ID
          this._http.document(`users/${this.sender.uid}`).collection('rooms').set(this.addressee.uid, { roomId: room.id }),
          this._http.document(`users/${this.addressee.uid}`).collection('rooms').set(this.sender.uid, { roomId: room.id })
        ]);
      });
    }

    req.subscribe(RxViewer);
  }

  delete(message: any) {
    this.roomsHandler.delete(message.id).subscribe(RxViewer);
  }

  // updateItem(message: any, value?: string) {
  //   if (message.update) {
  //     // this.messagesHandler.update(message.id, { content: value }).subscribe(RxViewer);
  //     message.update = false;
  //   }
  //   message.update = true;
  // }
}
