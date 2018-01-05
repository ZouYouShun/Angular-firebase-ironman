import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageModel } from '@core/model/message.model';
import { RoomModel, UserRoomModel } from '@core/model/room.model';
import { UserModel } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { replaceToBr } from '@shared/ts/data/replaceToBr';
import { RxViewer } from '@shared/ts/rx.viewer';
import { MessageRoomListComponent } from 'app/pages/message/message-room-list/message-room-list.component';
import { MessageService } from 'app/pages/message/message.service';
import { Observable } from 'rxjs/Observable';

import { MessageFriendListComponent } from '../message-friend-list/message-friend-list.component';


@Component({
  selector: 'app-message-detial',
  templateUrl: './message-detial.component.html',
  styleUrls: ['./message-detial.component.scss']
})
export class MessageDetialComponent extends AutoDestroy {

  @ViewChild('article', { read: ElementRef }) article: ElementRef;

  messageLoading = true;

  messages: MessageModel[];
  messageForm: FormGroup;

  sender: UserModel;

  addresseeId: string;

  private roomsHandler: CollectionHandler<RoomModel>;
  private messageHandler: CollectionHandler<MessageModel>;
  friends;

  constructor(
    private _http: BaseHttpService,
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _auth: AuthService,
    public _message: MessageService) {
    super();
    this.messageForm = this._fb.group({
      content: ''
    });

    this.roomsHandler = this._http.collection('rooms');

    if (this._route.parent.component === MessageFriendListComponent) {
      this.getMessageByUserId();
    } else if (this._route.parent.component === MessageRoomListComponent) {
      this.getMessageByRoomId();
    }
  }

  private getMessageByUserId() {
    this._route.params
      .combineLatest(this._auth.currentUser$.filter(u => !!u))
      .switchMap(([params, sender]) => {
        this.init(sender, params.addresseeId);
        return this._http.document(`users/${this.sender.uid}`)
          .collection('rooms')
          .document<UserRoomModel>(this.addresseeId).get();
      })
      .switchMap(usersRoom => this.getUsersRoom(usersRoom))
      .switchMap(room => {
        if (room) return this.getRoomsMessages(room.id);
        return Observable.of(null);
      })
      .takeUntil(this._destroy$)
      .subscribe(messages => {
        this.messageLoading = false;
        this.messages = messages;
        this.scrollButtom();
      });
  }

  private getMessageByRoomId() {
    // 取得房間資料
    // 取得所有人的資料
    this._route.params
      .combineLatest(this._auth.currentUser$.filter(u => !!u))
      .switchMap(([params, sender]) => {
        this.init(sender, params.addresseeId);
        return this.getRoomsMessages(params.roomId);
      })
      .takeUntil(this._destroy$)
      .subscribe(messages => {
        this.messageLoading = false;
        this.messages = messages;
        this.scrollButtom();
      });
  }

  private getUsersRoom(usersRoom): Observable<MessageModel> {
    if (usersRoom) {
      return this.roomsHandler.document<MessageModel>(usersRoom.roomId).get();
    }
    return Observable.of(null);
  }

  private getRoomsMessages(roomId): Observable<any> {
    this.messageHandler = this.roomsHandler.document(roomId).collection('messages');
    return this.messageHandler.get({
      isKey: false,
      queryFn: ref => ref.orderBy('createdAt')
    });
  }

  @runAfterTimeout()
  private scrollButtom() {
    if (this.article)
      this.article.nativeElement.scroll({ top: this.article.nativeElement.scrollHeight, left: 0 });
  }

  private init(sender, addresseeId = null) {
    this.messages = [];
    this.messageLoading = true;
    this.messageHandler = null;
    this.sender = sender;
    this.addresseeId = addresseeId;
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

    const message: MessageModel = {
      sender: this.sender.uid,
      addressee: this.addresseeId,
      content: content
    };

    if (this.messageHandler) {
      req = this.messageHandler.add(message);
    } else {
      req = this._http.request('/api/message/roomWithMessage').post({
        message: message
      });
    }

    req.subscribe();
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
