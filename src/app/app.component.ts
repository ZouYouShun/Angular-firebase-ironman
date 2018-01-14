import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { AlertConfirmService } from '@core/component/alert-confirm';
import { AuthService } from '@core/service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private _auth: AuthService,
    private updates: SwUpdate,
    private _alc: AlertConfirmService) {
    console.log('App working! 1.2.1');

    updates.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);
      this._alc.alert('有新版本的應用！請點擊確定已更新！')
        .ok(() => {
          updates.activateUpdate()
            .then(() => {
              document.location.reload();
            });
        });
    });
  }

}
