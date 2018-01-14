import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AlertConfirmComponent } from './alert-confirm.component';
import { AlertConfirmService } from './alert-confirm.service';
import { A11yModule } from '@angular/cdk/a11y';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    A11yModule,
    SharedModule
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
