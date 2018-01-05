import { BaseModel } from './base.model';
import { MessageModel } from './message';

export class RoomModel extends BaseModel {
  last: MessageModel;
}

export enum ROOM_TYPE {
  OneToOne = 1
}

export interface UserRoomModel extends BaseModel {
  roomId: string;
  type: ROOM_TYPE;
}
