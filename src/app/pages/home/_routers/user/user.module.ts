import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule
  ],
  declarations: [
    UserComponent,
    DashboardComponent,
    ProfileComponent
  ]
})
export class UserModule { }
