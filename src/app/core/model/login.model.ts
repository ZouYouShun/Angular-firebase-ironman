import * as firebase from 'firebase';
export const isOfflineForDatabase = {
  state: 'offline',
  updatedAt: firebase.database.ServerValue.TIMESTAMP,
};

export const isOnlineForDatabase = {
  state: 'online',
  updatedAt: firebase.database.ServerValue.TIMESTAMP,
};
