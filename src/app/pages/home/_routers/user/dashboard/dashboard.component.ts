import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/service/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user$;
  constructor(private _auth: AuthService) {
    this.user$ = this._auth.currentUser$;
  }

  ngOnInit() {
  }

}
