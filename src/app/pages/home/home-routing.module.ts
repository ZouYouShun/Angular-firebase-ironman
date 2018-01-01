import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guard/auth.guard';

import { HomeComponent } from './home.component';

const routes: Routes = [{
  path: '',
  component: HomeComponent,
  children: [
    {
      path: '',
      loadChildren: './_routers/message/message.module#MessageModule'
    },
    {
      path: 'user',
      loadChildren: './_routers/user/user.module#UserModule',
      canActivate: [AuthGuard]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
