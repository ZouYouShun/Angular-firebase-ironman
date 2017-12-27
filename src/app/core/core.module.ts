import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatIconRegistry } from '@angular/material';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { AuthService } from './service/auth.service';
import { BaseHttpService } from './service/base-http.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    BaseHttpService,
    AuthService
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule, private matIconRegistry: MatIconRegistry) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
    this.matIconRegistry.registerFontClassAlias('icomoon', 'icon');
    // <mat-icon fontSet="icomoon" fontIcon="icon-google"></mat-icon>
  }
}
