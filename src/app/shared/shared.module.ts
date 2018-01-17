import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxfUploaderModule } from 'ngxf-uploader';

import { ActionBoxComponent } from './component/action-box/action-box.component';
import { MyMaterialModuleModule } from './my-material-module.module';
import { SeachInputComponent } from './component/seach-input/seach-input.component';
import { ImgPipe } from './pipe/img.pipe';
import { SafePipe } from './pipe/safe.pipe';
import { CdkService } from './service/cdk.service';
import { AutofocusDirective } from './directive/autofocus.directive';
import { MessagePipe } from './pipe/message.pipe';
import { ShortDatePipe } from '@shared/pipe/short-date.pipe';

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
    ImgPipe,
    SeachInputComponent,
    AutofocusDirective,
    MessagePipe,
    ShortDatePipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    A11yModule,
    ReactiveFormsModule,
    MyMaterialModuleModule,
    FlexLayoutModule,
    NgxfUploaderModule,

    SafePipe,
    ImgPipe,
    MessagePipe,
    ShortDatePipe,

    ActionBoxComponent,
    SeachInputComponent,
    AutofocusDirective
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
