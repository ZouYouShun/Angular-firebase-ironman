import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrettyJsonModule } from 'angular2-prettyjson';

import { ViewContainerDirective } from './directive/view-container.directive';
import { MyMaterialModuleModule } from './my-material-module.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ViewContainerDirective
  ],
  exports: [
    PrettyJsonModule,
    ViewContainerDirective,
    FormsModule,
    ReactiveFormsModule,
    MyMaterialModuleModule,
    FlexLayoutModule,
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: SharedModule,
      providers: [
      ]
    };
  }
}
