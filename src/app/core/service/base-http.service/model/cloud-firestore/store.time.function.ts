import * as firebase from 'firebase';

export function storeTimeObject(obj: any, isNew = true) {
  const newObj = {
    ...obj,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  if (isNew) {
    newObj.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  }
  return newObj;
}
