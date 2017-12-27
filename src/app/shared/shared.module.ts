import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ActionBoxComponent } from './component/action-box/action-box.component';
import { AlertConfirmModule } from './component/alert-confirm/alert-confirm.module';
import { BlockViewComponent } from './component/block-view/block-view.component';
import { PopUpModule } from './component/pop-up/pop-up.module';
import { RouteLoadingComponent } from './component/route-loading/route-loading.component';
import { MyMaterialModuleModule } from './my-material-module.module';
import { SafePipe } from './pipe/safe.pipe';
import { BlockViewService } from './service/block-view.service';
import { CdkService } from './service/cdk.service';
import { RouteLoadingService } from './service/route-loading.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MyMaterialModuleModule,
  ],
  declarations: [
    SafePipe,
    ActionBoxComponent,

    RouteLoadingComponent,
    BlockViewComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopUpModule,
    AlertConfirmModule,
    MyMaterialModuleModule,
    FlexLayoutModule,
    RouteLoadingComponent,
    SafePipe,
    ActionBoxComponent,
  ],
  entryComponents: [
    BlockViewComponent,
    RouteLoadingComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: SharedModule,
      providers: [
        CdkService,
        BlockViewService,
        RouteLoadingService
      ]
    };
  }
}
