import { BaseModel } from './base.model';
import { MessageModel } from './message';

export class RoomModel extends BaseModel {
  last: MessageModel;
}

export interface UserRoomModel extends BaseModel {
  roomId: string;
}
