import { BaseModel } from './base.model';
import { MessageModel } from './message.model';

export class RoomModel extends BaseModel {
}


export class RoomUsersModel extends BaseModel {
  isReading: boolean;
}

export enum ROOM_TYPE {
  OneToOne = 1
}

export interface UserRoomModel extends BaseModel {
  roomId: string;
  type: ROOM_TYPE;
  last: MessageModel;
}
