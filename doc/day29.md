# [Angular Firebase 入門與實做] Day-29 [實做] 使用者已讀狀態 02 HTTP身分驗證 authentication
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> Within our dreams and aspirations we find our opportunities. --在我們的夢想及抱負裡，找到我們的機會。 (Sugar Ray Leonard)

# 今天目標
今天我們接著昨天的內容實做，把已讀的功能完成。

如果還沒看過昨天的文章的朋友要先去看那一篇，今天是接續上一篇的。

再看一次我們的進度
1. 是否在聊天室中   -- 完成
2. 訊息送出已讀人員寫入 -- 完成

3. 已讀數量顯示
4. 第一次進入後未讀的資料標示已讀

我們今天依序實做`已讀數量顯示`、`第一次進入後未讀的資料標示已讀`

## 已讀數量顯示

我們已經有存所有已讀的狀態的人員清單了，但是在目前的cloud firestore還沒有辦法做到直接一次讀取document底下的collection的功能，無法populate子collection，所以筆者這裡要使用trigger來達到我們要做的行為。

當每次有人寫入已讀的清單中，透過firestore trigger觸發執行寫入上層訊息已讀數量的功能，以下實做
```js
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { MESSAGE_TYPE, MessageModel } from '../../model/message.model';
import { BaseModel } from '../../model/base.model';
import { DeltaDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

// 當訊息的已讀人員有資料寫入時觸發
export const roomsMessageUsersfirestore = functions.firestore
  .document('/rooms/{roomId}/messages/{messageId}/readed/{readUserId}')
  .onWrite((event: functions.Event<DeltaDocumentSnapshot>) => {
    const firestore = admin.firestore();

    const readedData: BaseModel = event.data.data();
    const roomId = event.params.roomId;
    const messageId = event.params.messageId;

    const messageRef = firestore.doc(`/rooms/${roomId}/messages/${messageId}`);

    return messageRef.collection('readed').orderBy('updatedAt').get()
      .then((result) => {
        const lastData: BaseModel = result.docChanges[result.docChanges.length - 1].doc.data();
        // 如果當下的最後一筆大於這一筆資料的話，不處理，給後面的處理
        if (lastData.updatedAt > readedData.updatedAt) {
          return null;
        }
        // 如果是最後一筆那就給他當下的長度
        return messageRef.update({
          readedNum: result.docChanges.length || 0
        });
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  });
```
我們每次寫入的時候去比對當下最後一筆資料是否時間大於自己，若自己是最後一個已讀，那就更新時間，如果大於的話代表自己不是最後一個，不處理，給後面的處理。

`npm run deploy`

接著回到前端，修改一下顯示的部分
## 前端顯示
model先去修改一下，把readedNum加上去
```js
export interface MessageModel extends BaseModel {
  sender: string;
  addressee: string;
  content: string;
  type: MESSAGE_TYPE;
  readedNum?: number;
}
```
```html
{{message.readedNum > 0? ('已讀' + message.readedNum) : '沒人看'}}
```

done!  接著你可能會想測試，但是不要忘記我們有看狀態來寫入資料庫，除非你想用兩台電腦測試不然先把昨天的那邊註解吧
```js
this.roomUsers
  // .filter(u => u.isReading && this._message.friendsObj[u.id].loginStatus) 
  .forEach(user => {
    const readHandler = msg.collection(`readed`).document(user.id);
    batchHandler.set(readHandler, {});
  });
```
然後我們就能測試看看瞜~試試看，我們就能看到優美的`已讀1`了=ˇ=

## 登入時抓取所有未讀訊息，將未讀的資料標示為已讀

最後我們來實做當使用者第一次登入時把所有訊息未讀的取出來，並且加上自己，這裡我們一樣透過functions來實做，我們使用HTTP trigger，直接放在先前我們實作的API底下

我們先到api底下的message.api.ts加上方法
```js
export const messageApi = Router()
  .post('/roomWithMessage', roomWithMessageHandler)
  .post('/checkMessageReaded', checkMessageReadedHandler);
```

我們建立一個`checkMessageReadedHandler`在api/message資料夾底下

接著開始實做，實做前我們先想一下我們的API要有那些東西傳入，又要回傳什麼東西

我們的目的是透過`使用者uid`、`聊天室roomId`來將這個聊天室的訊息標示已讀，因此我們的傳入應該是
```json
{
  "uid":"string",
  "roomId":"roomId",
}
```
你可能會問，這樣不就很不安全，只要知道參數就能透過post來達到整個房間的訊息已讀，沒錯，所以這邊我們應該要在api進來前先做身分驗證，通過驗證後才能進行處理，並且透過驗證的過程中就能知道這個人是誰了，因此我們的uid也是不需要的參數，我們最後傳的應該只有`"rooomId"`而已。

那我們想回傳什麼？我們想透過這個功能來回傳未讀訊息的第一筆的ID，如此一來我們將來可以透過這個ID讓使用者停留在那筆訊息的位置，並且標示：`『以下為尚未閱讀的訊息』`。

那我們開始實做，先重身分驗證開始

筆者這邊都是使用express的設定來實做，如果不知道怎麼時做的朋友可以回去看一下[day14]([Angular Firebase 入門與實做] Day-14 Cloud Functions HTTP Triggers)、[day15](https://ithelp.ithome.com.tw/articles/10195880)。

## HTTP 身分驗證

建立一個`loginCheck`來做身分的驗證，透過Express middleware 的方式在api前就做好身分的驗證

下面我們透過token來實做，並透過admin來驗證帳號，最後把帳號指定到req的body去給接下去的route使用
```ts
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { CONFIG } from '../config';

export const loginCheck = (req: Request, res: Response, next: NextFunction) => {
    console.log('開始檢查使用者狀態');
    const authorization = req.headers.authorization as string;

    if (!authorization || !authorization.startsWith(CONFIG.tokenAlias)) {
        console.error('找不到Token喔');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (authorization && authorization.startsWith(CONFIG.tokenAlias)) {
        console.log('找到 Token了');
        idToken = authorization.split(CONFIG.tokenAlias)[1];
    }

    admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
        console.log('使用者：', decodedIdToken);
        (<any>req).user = decodedIdToken; // 這裡要用強行別的指定方式，因為Express的req並沒有客製的屬性
        next(); // 如果通過就呼叫next()，並且把user指定在body的user中
    }).catch(error => {
        console.error('找不到這個ID的使用者:', error);
        res.status(403).send('Unauthorized');
    });
};
```

接著再回到message.api.ts的部分，把這個身分驗證加上去
```js
import { loginCheck } from '../libs/login-check';

export const messageApi = Router()
  .use(loginCheck)
  .post('/roomWithMessage', roomWithMessageHandler)
  .post('/checkMessageReaded', checkMessageReadedHandler);
```
要注意順序喔，use是有順序之分的，放在前面才會執行。

接著我們實作checkMessageReadedHandler的部分

#### checkMessageReadedHandler

由於現階段，cloud firestore並沒有提通我們query subcollection的功能，因此我們無法直接把所有沒有自己的message找出來，在寫入。

但是我們可以根據使用者最後讀取的時間，把那個時間往後的資料全部寫入讀自己已讀，藉此達到我們的需求，以下實做。

```js
import * as admin from 'firebase-admin';

import { storeTimeObject } from '../../libs/timestamp';
import { BaseModel } from '../../model/base.model';

export const checkMessageReadedHandler = async (req, res, next) => {
  try {
    const firestore = admin.firestore();
    const user: admin.auth.DecodedIdToken = req.user;
    console.log(user);
    const roomId = req.body.roomId;

    const roomRef = firestore.doc(`/rooms/${roomId}`);
    const roomMessagesRef = roomRef.collection(`messages`);
    const myReadStatus: BaseModel = await roomRef.collection(`users`).doc(user.uid).get();

    // 這裡一樣用batch做批次寫入
    const batch = firestore.batch();
    let firstNotReadedMessageId;

    // 我們根據使用者最後讀取的時間，把往後的資料全部都寫讀已讀
    return roomMessagesRef.orderBy('updatedAt').startAt(myReadStatus.updatedAt).get()
      .then((result) => {
        const data = result.docChanges;
        firstNotReadedMessageId = data[0].doc.id;
        data.forEach(message => {
          const messageReadedDoc = message.doc.ref.collection(`readed`).doc(user.uid);
          batch.set(messageReadedDoc, storeTimeObject({}));
        });
        return batch.commit();
      }).then((result) => {
        return res.success({
          message: 'add message success',
          obj: firstNotReadedMessageId
        });
      });
  } catch (error) {
    return res.status(500).json({
      message: 'fail',
      obj: error
    });
  }
}
```

在使用者focus的時候，一併送出這個要求去把訊息標示已讀。

```js
merge(
  // 取得訊息相關
  message$,
  // 取得使用者狀態
  this._loginStatus.userFocusStatus$.pipe(
    switchMap(status => {
      if (!status) {
        return this._message.setLeave();
      }
      // 我們在寫入已讀後，去呼叫我們的方法
      return this._message.setReading().pipe(
        switchMap(() => {
          if (this.roomId) {
            return this._http.request('/api/message/checkMessageReaded').post({
              roomId: this.roomId
            });
          }
          return of(null);
        }));
    })
  ))
  .pipe(takeUntil(this._destroy$))
  .subscribe();
```

不要忘記也要傳入token!

完成!



# 本日小節
今天我們把已讀功能實作完畢了，也了解在HTTP要如何做authentication，雖然目前沒有query subcollections的方法，但是透過時間，也是足夠的！方法是人想出來的！特別在還在起步的時候，真的特別需要花點心思啊，經過這次已讀的實做，相信大家對整個firebase的生命週期有了更多的了解了。


# 本日原始碼
|名稱|網址|
|---|---|
|Angular| https://github.com/ZouYouShun/Angular-firebase-ironman/tree/day29_read_status_2|


# 參考資料
https://github.com/firebase/functions-samples/blob/master/authenticated-json-api/README.md
https://ithelp.ithome.com.tw/articles/10193657
