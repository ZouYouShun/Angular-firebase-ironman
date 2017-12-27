import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule } from '@angular/material';

import { AlertConfirmComponent } from './alert-confirm.component';
import { AlertConfirmService } from './alert-confirm.service';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
  ],
  declarations: [
    AlertConfirmComponent
  ],
  entryComponents: [AlertConfirmComponent]
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
