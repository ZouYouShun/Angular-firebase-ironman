import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MenuComponent } from './menu/menu.component';
import { SharedModule } from '@shared/shared.module';
import { HomeMenuComponent } from './home-menu/home-menu.component';
import { SettingMenuComponent } from './home-menu/setting-menu/setting-menu.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    HomeMenuComponent,
    SettingMenuComponent,
    MenuComponent
  ]
})
export class HomeModule { }
