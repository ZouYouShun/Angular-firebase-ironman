import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule,
  ],
  declarations: [
    UserComponent,
    DashboardComponent,
    ProfileComponent
  ]
})
export class UserModule { }
