# [Angular Firebase 入門與實做] Day-24 Progressive Web App with Firebase 2
每日一句來源：[Daily English](https://play.google.com/store/apps/details?id=net.eocbox.dailysentence)

> No spring nor summer beauty hath such grace, as I have seen in one autumnal face. --無論是春天的俏，還是夏天的美，都沒有秋天的這份優雅。(John Donne)

昨天我們了解了基本的PWA的方式，但是當使用著的檔案cache了之後我們該如何更新？總不能叫使用者清除cache來更新吧，所以Angular有提供更新的方法。我們來實做看看

我們可以根據[官方文件](https://angular.io/guide/service-worker-communications)知道可以透過`SwUpdate`來操作更新檔案，以下實作
```js
export class AppComponent {

  constructor(
    private _auth: AuthService,
    // 這裡注入
    private updates: SwUpdate,
    private _alc: AlertConfirmService) {
    // 我們這裡可以自己標記版本
    console.log('App working! 1.2.1');

    // 當有可用更新時
    updates.available.subscribe(event => {
      // 顯示現在版本
      console.log('current version is', event.current);
      // 顯示可用版本
      console.log('available version is', event.available);
      // 跳提示給使用者更新
      this._alc.alert('有新版本的應用！請點擊確定已更新！')
        .ok(() => {
          updates.activateUpdate()
            .then(() => {
              // 當檔案更新完成，就重新整理畫面
              document.location.reload();
            });
        });
    });
  }
}
```

就這樣~!我們就能當我們的APP有更新的時候，我們可以讓使用者更新檔案!


# 本日小節
今天我們為PWA加入更新的功能，讓使用者能透過`SwUpdate`來更新檔案，可以說Angular想得很周到啊!連這些部分都有想到，真的覺得未來在實作上真的是越來越方便了。
