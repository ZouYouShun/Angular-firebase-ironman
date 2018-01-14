import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import { Component, ElementRef, ViewChild, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageModel, MESSAGE_TYPE } from '@core/model/message.model';
import { RoomModel, UserRoomModel } from '@core/model/room.model';
import { UserModel } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService, CollectionHandler, DocumentHandler } from '@core/service/base-http.service';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { replaceToBr } from '@shared/ts/data/replaceToBr';
import { RxViewer } from '@shared/ts/rx.viewer';
import { MessageRoomListComponent } from 'app/pages/message/message-room-list/message-room-list.component';
import { MessageService } from 'app/pages/message/message.service';
import { Observable } from 'rxjs/Observable';

import { MessageFriendListComponent } from '../message-friend-list/message-friend-list.component';
import { FileError } from 'ngxf-uploader';
import { UploadService } from '@core/service/upload.service';
import { arrayToObjectByKey } from '@shared/ts/data/arrayToObjectByKey';
import { Subject } from 'rxjs/Subject';
import { StringHandler } from '@shared/ts/data/string.handler';


@Component({
  selector: 'app-message-detial',
  templateUrl: './message-detial.component.html',
  styleUrls: ['./message-detial.component.scss']
})
export class MessageDetialComponent extends AutoDestroy {

  @ViewChild('article', { read: ElementRef }) article: ElementRef;


  messageLoading = true;

  messages: MessageModel[] = [];
  messageForm: FormGroup;

  sender: UserModel;
  addresseeId: string;
  uploading = false;

  private roomsHandler: CollectionHandler<RoomModel[]>;
  private messageHandler: CollectionHandler<MessageModel>;

  private roomId: string;
  private roomHandler: DocumentHandler<RoomModel>;
  private roomFiles = {};

  constructor(
    private _http: BaseHttpService,
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _auth: AuthService,
    public _message: MessageService,
    public _upload: UploadService) {
    super();
    this.messageForm = this._fb.group({
      content: ''
    });

    this.roomsHandler = this._http.collection('rooms');
    let message$: Observable<any>;
    if (this._route.parent.component === MessageFriendListComponent) {
      message$ = this.getMessageByUserId();
    } else if (this._route.parent.component === MessageRoomListComponent) {
      message$ = this.getMessageByRoomId();
    }

    message$
      .do(messages => {
        this.messageLoading = false;
        this.messages = messages;
        this.scrollButtom();
      })
      .switchMap(() => {
        if (this.roomHandler) {
          return this.roomHandler.collection<any>('files').get()
            .do(files => {
              this.roomFiles = arrayToObjectByKey(files, 'id');
            });
        }
        return Observable.of(null);
      })
      .takeUntil(this._destroy$)
      .subscribe();
  }

  goList() {
    this._message.goList();
  }

  private getMessageByUserId() {
    return this._route.params
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
      });
  }

  private getMessageByRoomId() {
    // 取得房間資料
    // 取得所有人的資料
    return this._route.params
      .combineLatest(this._auth.currentUser$.filter(u => !!u))
      .switchMap(([params, sender]) => {
        this.init(sender, params.addresseeId);
        return this.getRoomsMessages(params.roomId);
      });
  }

  private getUsersRoom(usersRoom): Observable<MessageModel> {
    if (usersRoom) {
      return this.roomsHandler.document<MessageModel>(usersRoom.roomId).get();
    }
    return Observable.of(null);
  }

  private getRoomsMessages(roomId): Observable<any> {
    this.roomId = roomId;
    this.roomHandler = this.roomsHandler.document<RoomModel>(roomId);
    this.messageHandler = this.roomHandler.collection('messages');
    return this.messageHandler.get({
      isKey: true,
      queryFn: ref => ref.orderBy('createdAt')
    });
  }

  @runAfterTimeout()
  private scrollButtom(behavior: 'auto' | 'smooth' = 'auto') {
    if (this.article)
      this.article.nativeElement.scroll({
        top: this.article.nativeElement.scrollHeight,
        left: 0,
        behavior: behavior
      });
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
    const content = this.messageForm.value.content;
    this.messageForm.reset();
    if (new StringHandler(content).isEmpty()) {
      return;
    }

    this.getMessageObs(content).subscribe();
  }

  uploadFile(file: File | FileError) {
    if (!(file instanceof File)) {
      this._upload.fileErrorHandler(file);
      return;
    }

    const filePath = encodeURIComponent(`${new Date().getTime()}_${file.name}`);
    const fileHandler = this._upload.fileHandler(filePath);

    this.uploading = true;

    return this.getMessageObs(filePath, MESSAGE_TYPE.FILE)
      .mergeMap(() => fileHandler.upload({ file: file }))
      .subscribe(RxViewer);
  }


  private getMessageObs(content, type = MESSAGE_TYPE.MESSAGE) {
    let req: Observable<any>;
    content = replaceToBr(content);

    const message: MessageModel = {
      sender: this.sender.uid,
      addressee: this.addresseeId,
      content: content,
      type: type
    };

    if (this.messageHandler) {
      req = this.messageHandler.add(message);
    } else {
      req = this._http.request('/api/message/roomWithMessage').post({
        message: message
      });
    }
    return req;
  }

  // updateItem(message: any, value?: string) {
  //   if (message.update) {
  //     // this.messagesHandler.update(message.id, { content: value }).subscribe(RxViewer);
  //     message.update = false;
  //   }
  //   message.update = true;
  // }
  // delete(message: any) {
  //   this.roomsHandler.delete(message.id).subscribe(RxViewer);
  // }
  trackByFn(index, item) {
    return item.id; // or item.name
  }
}
