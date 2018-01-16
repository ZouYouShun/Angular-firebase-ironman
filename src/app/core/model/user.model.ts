import { RoomModel } from './room.model';
import { BaseModel } from '@core/model/base.model';

export enum USER_TYPE {
  GOOGLE = 'google.com',
  FACEBOOK = 'facebook.com',
  EMAIL = 'email'
}


export interface UserModel extends BaseModel {
  uid?: string;
  email: string;
  displayName?: string;
  type?: USER_TYPE;
  catchPhrase?: string;
  photoURL?: string;
  loginStatus?: boolean;
  lastSignInTime?: string;
  firend?: any;
  rooms?: { [s: string]: RoomModel };
}
