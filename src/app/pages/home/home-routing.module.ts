import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [{
  path: '',
  component: HomeComponent,
  children: [
    {
      path: '',
      loadChildren: './_routers/message/message.module#MessageModule'
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
