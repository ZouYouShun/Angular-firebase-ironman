import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { CloudMessagingService } from '@core/service/cloud-messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  message;
  constructor(private _auth: AuthService, private msgService: CloudMessagingService) {
    console.log('App working!');
  }
  ngOnInit() {
    this.msgService.getPermission();
  }

}
