import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule } from '@angular/material';

import { AlertConfirmComponent } from './alert-confirm.component';
import { AlertConfirmService } from './alert-confirm.service';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    A11yModule
  ],
  declarations: [
    AlertConfirmComponent
  ],
  entryComponents: [
    AlertConfirmComponent
  ]
})
export class AlertConfirmModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: AlertConfirmModule,
      providers: [
        AlertConfirmService
      ]
    };
  }
}
