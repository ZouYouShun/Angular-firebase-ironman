import { Component, ElementRef, ViewChild, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageModel, MESSAGE_TYPE } from '@core/model/message.model';
import { RoomModel, UserRoomModel, RoomUsersModel } from '@core/model/room.model';
import { UserModel } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService, CollectionHandler, DocumentHandler } from '@core/service/base-http.service';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';
import { AutoDestroy } from '@shared/ts/auto.destroy';
// import { replaceToBr } from '@shared/ts/data/replaceToBr';
import { MessageRoomListComponent } from 'app/pages/message/message-room-list/message-room-list.component';
import { MessageService } from 'app/pages/message/message.service';
import { Observable } from 'rxjs/Observable';

import { MessageFriendListComponent } from '../message-friend-list/message-friend-list.component';
import { FileError } from 'ngxf-uploader';
import { UploadService } from '@core/service/upload.service';
import { arrayToObjectByKey } from '@shared/ts/data/arrayToObjectByKey';
import { Subject } from 'rxjs/Subject';
import { StringHandler } from '@shared/ts/data/string.handler';
import { takeUntil, switchMap, tap, combineLatest, filter, take, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { dbTimeObject } from '@core/service/base-http.service/model/realtime-database/db.time.function';
import * as firebase from 'firebase';
import { LoginStatusService } from '@core/service/login-status.service';
import { merge } from 'rxjs/observable/merge';
import { BaseModel } from '@core/model/base.model';


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

  private roomsHandler: CollectionHandler<RoomModel[]>;
  private roomMessageHandler: CollectionHandler<MessageModel>;

  private roomHandler: DocumentHandler<RoomModel>;
  private roomUsersHandler: CollectionHandler<RoomUsersModel>;


  private roomId: string;
  private roomFiles = {};
  private roomUsers: RoomUsersModel[] = [];

  constructor(
    public _message: MessageService,
    private _http: BaseHttpService,
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _auth: AuthService,
    private _upload: UploadService,
    private _loginStatus: LoginStatusService) {
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

    merge(
      // 取得訊息相關
      message$,
      // 取得使用者狀態
      this._loginStatus.userFocusStatus$.pipe(
        switchMap(status => {
          if (!status) {
            return this._message.setLeave();
          }
          return this._message.setReading().pipe(
            switchMap( () => {
              if (this.roomId) {
                return this._http.request('api/message/checkMessageReaded').post({
                  roomId: this.roomId
                // tslint:disable-next-line:max-line-length
                }, false, ``);
              }
              return of(null);
            })
          );
        })
      ))
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }


  private getMessageByUserId() {
    return this._route.params.pipe(
      combineLatest(this._auth.currentUser$.pipe(filter(u => !!u), take(1))),
      switchMap(([params, sender]) => {
        this.init(sender, params.addresseeId);
        return this._http.document(`users/${this.sender.uid}`)
          .collection('rooms')
          .document<UserRoomModel>(this.addresseeId).get();
      }),
      switchMap(usersRoom => this.getUsersRoom(usersRoom)),
      switchMap(room => {
        if (room) return this.getRoomsMessages(room.id);
        return of(null);
      })
    );
  }

  private getMessageByRoomId() {
    // 取得房間資料
    // 取得所有人的資料
    return this._route.params.pipe(
      combineLatest(this._auth.currentUser$.pipe(filter(u => !!u), take(1))),
      switchMap(([params, sender]) => {
        this.init(sender, params.addresseeId);
        return this.getRoomsMessages(params.roomId);
      })
    );
  }

  private getUsersRoom(usersRoom): Observable<BaseModel> {
    if (usersRoom) {
      return this.roomsHandler.document<BaseModel>(usersRoom.roomId).get();
    }
    return of(null);
  }

  private getRoomsMessages(roomId): Observable<any> {
    // 檢查房間ID是否改變
    if (this.roomId && this.roomId !== roomId) {
      console.log('room changed');
      this._message.setLeave();
    }
    this.roomId = roomId;
    this.roomHandler = this.roomsHandler.document<RoomModel>(roomId);

    this.roomUsersHandler = this.roomHandler.collection('users');
    this.roomMessageHandler = this.roomHandler.collection('messages');

    this._message.myReadStatusHandler =
      this.roomUsersHandler.document<RoomUsersModel>(this.sender.uid);

    // 先寫完當下的讀取狀態
    return merge(
      // 取得檔案
      this.roomHandler.collection<any>('files').get().pipe(
        tap((files) => {
          this.roomFiles = arrayToObjectByKey(files, 'id');
        })
      ),
      // 取得人員
      this.roomUsersHandler.get().pipe(
        tap((users) => {
          this.roomUsers = users.filter(u => u.id !== this.sender.uid);
        })
      ),
      // 取得訊息
      this.roomMessageHandler.get({
        isKey: true,
        queryFn: ref => ref.orderBy('updatedAt')
      }).pipe(
        tap(messages => {
          this.messageLoading = false;
          this.messages = messages;
          this.scrollButtom();
          console.log('get message');
        })
        )
    );
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
    this.sender = sender;
    this.addresseeId = addresseeId;

    this.roomMessageHandler = null;
    this.roomUsersHandler = null;
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

    return this.getMessageObs(filePath, MESSAGE_TYPE.FILE).pipe(
      switchMap(() => fileHandler.upload({ file: file }))
    ).subscribe();
  }

  private getMessageObs(content, type = MESSAGE_TYPE.MESSAGE) {
    let req: Observable<any>;

    const message: MessageModel = {
      sender: this.sender.uid,
      addressee: this.addresseeId,
      content: content,
      type: type
    };

    if (this.roomMessageHandler) {
      req = this.roomMessageHandler.add(message).pipe(
        switchMap(msg => {
          const batchHandler = this._http.batch();

          // 取出所有正在讀取的人，一次寫進去讀取人的列表
          this.roomUsers
            .filter(u => u.isReading && this._message.friendsObj[u.id].loginStatus)
            .forEach(user => {
              const readHandler = msg.collection(`readed`).document(user.id);
              batchHandler.set(readHandler, {});
            });
          return batchHandler.commit();
        })
      );
    } else {
      req = this._http.request('/api/message/roomWithMessage').post({
        message: message
      });
    }
    return req;
  }

  trackByFn(index, item) {
    return item.id; // or item.name
  }

  goList() {
    this._message.goList();
  }
}
