import { Component } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RxViewer } from '@shared/ts/rx.viewer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private _auth: AuthService) {
    console.log('App working!');
  }

}
