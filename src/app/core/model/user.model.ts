import { Room } from './room.model';

export interface User {
  uid?: string;
  email: string;
  displayName?: string;
  type?: string;
  catchPhrase?: string;
  photoURL?: string;
  lastSignInTime?: string;
  rooms?: { [s: string]: Room };
}
