import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ActionBoxComponent } from './component/action-box/action-box.component';
import { MyMaterialModuleModule } from './my-material-module.module';
import { SafePipe } from './pipe/safe.pipe';
import { CdkService } from './service/cdk.service';
import { ImgPipe } from './pipe/img.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MyMaterialModuleModule,
  ],
  declarations: [
    SafePipe,
    ActionBoxComponent,
    ImgPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MyMaterialModuleModule,
    FlexLayoutModule,
    SafePipe,
    ImgPipe,
    ActionBoxComponent,
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: SharedModule,
      providers: [
        CdkService
      ]
    };
  }
}
