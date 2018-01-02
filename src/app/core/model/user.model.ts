import { RoomModel } from './room.model';

export interface UserModel {
  uid?: string;
  email: string;
  displayName?: string;
  type?: string;
  catchPhrase?: string;
  photoURL?: string;
  lastSignInTime?: string;
  rooms?: { [s: string]: RoomModel };
}
