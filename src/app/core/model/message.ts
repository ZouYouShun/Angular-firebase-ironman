import { BaseModel } from '@core/model/base.model';

export interface MessageModel extends BaseModel {
  sender: string;
  addressee: string;
  content: string;
}
