import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageModel } from '@core/model/message';
import { RoomModel, UserRoomModel } from '@core/model/room.model';
import { UserModel } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { RxViewer } from '@shared/ts/rx.viewer';
import { Observable } from 'rxjs/Observable';
import { replaceToBr } from '@shared/ts/data/replaceToBr';


@Component({
  selector: 'app-message-detial',
  templateUrl: './message-detial.component.html',
  styleUrls: ['./message-detial.component.scss']
})
export class MessageDetialComponent extends AutoDestroy {

  @ViewChild('article', { read: ElementRef }) article: ElementRef;

  messages: MessageModel[];
  messageForm: FormGroup;
  sender: UserModel;
  addressee: UserModel;

  private roomsHandler: CollectionHandler<RoomModel>;
  private messageHandler: CollectionHandler<MessageModel>;

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

        return this._http.document<UserModel>(`users/${addressee.id}`).get();
      })
      .switchMap(addressee => {
        this.addressee = addressee;
        // 取得送出者對應收件者的聊天室資料
        return this._http.document(`users/${this.sender.uid}`)
          .collection('rooms')
          .document<UserRoomModel>(this.addressee.uid).get();
      })
      .switchMap(usersRoom => {
        console.log('get room!');
        // 取得房間內容
        if (usersRoom) {
          return this.roomsHandler.document<MessageModel>(usersRoom.roomId).get();
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

  submitMessage(event?) {
    if (event) event.preventDefault();
    let content = this.messageForm.value.content;
    this.messageForm.reset();
    if (!content.trim()) {
      return;
    }
    let req: Observable<any>;
    content = replaceToBr(content);

    // 先寫房間ID
    if (this.messageHandler) {
      req = this.messageHandler.add({
        sender: this.sender.uid,
        addressee: this.addressee.uid,
        content: content
      });
    } else {
      req = this._http.request('/api/message/roomWithMessage').post({
        message: {
          sender: this.sender.uid,
          addressee: this.addressee.uid,
          content: content
        }
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
