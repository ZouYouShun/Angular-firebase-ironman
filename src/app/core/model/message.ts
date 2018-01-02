import { BaseModel } from '@core/model/base.model';

export interface MessageModel extends BaseModel {
  // uid: string;
  users: string[];
  content: string;
}
