import { CommonModule, JsonPipe } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { PrettyJsonModule, SafeJsonPipe } from 'angular2-prettyjson';
import { ViewContainerDirective } from './directive/view-container.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


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
    ViewContainerDirective
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
