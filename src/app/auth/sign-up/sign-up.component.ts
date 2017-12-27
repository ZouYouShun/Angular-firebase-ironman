import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/service/auth.service';
import { RxViewer } from '@shared/ts/rx.viewer';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signupForm: FormGroup;

  constructor(public _auth: AuthService, private _fb: FormBuilder) {
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
      ]],
      'name': ['', [Validators.required]]
    });
  }

  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }

  signup() {
    this._auth.signUpByEmail(this.email.value, this.password.value, this.name.value).subscribe(RxViewer);
  }

  signInUpByGoogle() {
    this._auth.signInUpByGoogle().subscribe();
  }

  signInUpByFacebook() {
    this._auth.signInUpByFacebook().subscribe();
  }

}
