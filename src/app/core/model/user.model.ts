import { RoomModel } from './room.model';
import { BaseModel } from '@core/model/base.model';

export interface UserModel extends BaseModel {
  uid?: string;
  email: string;
  displayName?: string;
  type?: string;
  catchPhrase?: string;
  photoURL?: string;
  lastSignInTime?: string;
  firend?: any;
  rooms?: { [s: string]: RoomModel };
}
