import { Base } from '@core/model/base.model';

export interface Message extends Base {
  // uid: string;
  users: string[];
  content: string;
}
