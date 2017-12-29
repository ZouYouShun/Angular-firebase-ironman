import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { PopUpService } from './pop-up.service';

import { PopUpComponent } from '../pop-up/pop-up.component';
import { ViewContainerDirective } from '../pop-up/view-container.directive';


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
  ],
  declarations: [
    PopUpComponent,
    ViewContainerDirective,
  ],
  exports: [
    PopUpComponent
  ],
  entryComponents: [
    PopUpComponent
  ]
})
export class PopUpModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: PopUpModule,
      providers: [PopUpService]
    };
  }
}
