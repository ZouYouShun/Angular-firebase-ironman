import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  signupForm: FormGroup;

  constructor(private _auth: AuthService, private _fb: FormBuilder) {
    // 不管是誰進來這一頁直接登出。
    this._auth.signOut();
  }

  ngOnInit() {
    this.signupForm = this._fb.group({
      'email': ['', [Validators.email, Validators.required]],
      'password': ['', [
        Validators.required,
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25)
      ]]
    });
  }

  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }

  signIn() {
    this._auth.signInByEmail(this.email.value, this.password.value);
  }

  signInGoogle() {
    this._auth.signInUpByGoogle();
  }

  resetPassword() {
    this._auth.resetPassword(this.password.value);
  }
}
