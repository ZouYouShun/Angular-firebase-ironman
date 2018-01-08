import { BaseModel } from '@core/model/base.model';

export enum MESSAGE_TYPE {
  MESSAGE = 'message',
  FILE = 'file'
}

export interface MessageModel extends BaseModel {
  sender: string;
  addressee: string;
  content: string;
  type: MESSAGE_TYPE;
}
