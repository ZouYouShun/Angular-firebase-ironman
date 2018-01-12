import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { HomeModule } from './home/home.module';

@NgModule({
  imports: [
    CommonModule,
    PagesRoutingModule,
    HomeModule
  ],
  declarations: []
})
export class PagesModule { }
