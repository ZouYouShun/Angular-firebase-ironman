import { Component } from '@angular/core';
import { AuthService } from '@core/service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private _auth: AuthService) {
    this._auth.currentUser.subscribe((u) => console.log(u));
  }

}
