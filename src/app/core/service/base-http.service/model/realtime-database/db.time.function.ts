import * as firebase from 'firebase';

export function dbTimeObject(obj: any, isNew = true) {
  const newObj = {
    ...obj,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  if (isNew) {
    newObj.createdAt = firebase.database.ServerValue.TIMESTAMP;
  }
  return newObj;
}
