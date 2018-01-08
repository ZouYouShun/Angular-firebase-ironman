import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { NgxfUploaderModule } from 'ngxf-uploader';

import { ActionBoxComponent } from './component/action-box/action-box.component';
import { MyMaterialModuleModule } from './my-material-module.module';
import { ImgPipe } from './pipe/img.pipe';
import { SafePipe } from './pipe/safe.pipe';
import { CdkService } from './service/cdk.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    A11yModule,
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
    A11yModule,
    ReactiveFormsModule,
    MyMaterialModuleModule,
    FlexLayoutModule,
    PrettyJsonModule,
    NgxfUploaderModule,

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
