import { Component, Renderer2 } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { AlertConfirmService } from '@core/component/alert-confirm';
import { AuthService } from '@core/service/auth.service';
import { LoginStatusService } from '@core/service/login-status.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private _auth: AuthService,
    private _loginState: LoginStatusService,
    private _alc: AlertConfirmService,
    private _swUpdate: SwUpdate,
    private _renderer: Renderer2) {
    console.log('App working! 1.2.1');

    _swUpdate.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);
      this._alc.alert('有新版本的應用！請點擊確定已更新！')
        .ok(() => {
          _swUpdate.activateUpdate()
            .then(() => {
              document.location.reload();
            });
        });
    });

    if (window) {
      this._renderer.listen(window, 'focus', () => {
        this._loginState.changeFocus(true);
      });
      this._renderer.listen(window, 'blur', () => {
        this._loginState.changeFocus(false);
      });
    }
  }

}
