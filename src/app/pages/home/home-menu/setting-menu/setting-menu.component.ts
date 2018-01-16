import { Component } from '@angular/core';
import { AlertConfirmModel, AlertConfirmService } from '@core/component/alert-confirm';
import { AuthService } from '@core/service/auth.service';
import { BlockViewService } from '@core/service/block-view.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-setting-menu',
  templateUrl: './setting-menu.component.html',
  styleUrls: ['./setting-menu.component.scss']
})
export class SettingMenuComponent {

  islogin$;

  constructor(
    public _auth: AuthService,
    private _alc: AlertConfirmService,
    private _block: BlockViewService) {
    this.islogin$ = _auth.currentUser$;
  }


  alert() {
    console.log(123);
    this._alc.alert('!!')
      .ok(() => {

        this._alc.confirm('!!')
          .ok(() => {
            alert('ok');
          })
          .cancel(() => {
            confirm('ok');
          });
        // setTimeout(() => {
        //   this._block.unblock(() => {
        //     this._alc.alert('good');
        //   });
        // }, 2000);
      });
    // this.userSettingsPortal.detach();
  }

  block() {
    this._block.block('跑跑跑');

    setTimeout(() => {
      this._block.unblock();
      // this.portalHost.detach();
    }, 1000);
  }

  logOut() {
    this._alc.confirm(new AlertConfirmModel('確認', '確定要登出嗎？', 'success'))
      .ok(() => {
        this._auth.signOut().pipe(
          tap(() => {
            console.log('登出了');
            this._alc.alert(new AlertConfirmModel('登出成功', '嗚嗚不要走~~~', 'warning'));
          })
        ).subscribe();
      })
      .cancel(() => {
        this._alc.alert(new AlertConfirmModel('不登出', '嘿嘿就知道你還是愛我們的！', 'info'));
      });

  }

}
