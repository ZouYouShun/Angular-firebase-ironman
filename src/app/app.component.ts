import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { CloudMessagingService } from '@core/service/cloud-messaging.service';

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
