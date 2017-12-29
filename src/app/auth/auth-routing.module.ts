import { ResetPwdComponent } from './reset-pwd/reset-pwd.component';
import { ForgotPwdComponent } from './forgot-pwd/forgot-pwd.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'signin',
        component: SignInComponent,
        canActivate: [],
        data: {
          title: '登入'
        },
      },
      {
        path: 'signup',
        component: SignUpComponent,
        canActivate: [],
        data: {
          title: '註冊'
        },
      },
      {
        path: 'forgot-password',
        component: ForgotPwdComponent
      },
      {
        path: 'reset-password',
        component: ResetPwdComponent
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
