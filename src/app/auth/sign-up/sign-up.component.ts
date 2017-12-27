import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signupForm: FormGroup;
  detialForm: FormGroup;

  constructor(public _auth: AuthService, private _fb: FormBuilder) { }

  ngOnInit() {
    this.signupForm = this._fb.group({
      'email': ['', [Validators.email, Validators.required]],
      'password': ['', [
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25)
      ]]
    });
    this.detialForm = this._fb.group({
      'catchPhrase': ['', [Validators.required]]
    });
  }

  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get catchPhrase() { return this.detialForm.get('catchPhrase'); }

  signup() {
    return this._auth.signUpByEmail(this.email.value, this.password.value);
  }

  // setCatchPhrase(user) {
  //   return this._auth.editUser(user, { catchPhrase: this.catchPhrase.value });
  // }

  signIn() {
    this._auth.signInByEmail(this.email.value, this.password.value);
  }
  signInGoogle() {
    this._auth.signInUpByGoogle();
  }

  signOut() {
    this._auth.signOut();
  }

  resetPassword() {
    this._auth.resetPassword(this.password.value);
  }
}
