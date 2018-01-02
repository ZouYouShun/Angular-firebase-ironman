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
    // this._auth.currentUser$.take(1)
    //   .subscribe(user => {
    //     if (user) {
    //       this._auth.signOut();
    //     }
    //   });
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
    this._auth.signUpByEmail({
      email: this.email.value,
      password: this.password.value,
      name: this.name.value
    }).subscribe(RxViewer);
  }

  signInUpByGoogle() {
    this._auth.signInUpByGoogle(true).subscribe();
  }

  signInUpByFacebook() {
    this._auth.signInUpByFacebook(true).subscribe();
  }

}
