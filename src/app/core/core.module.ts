import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { CloudMessagingService } from '@core/service/cloud-messaging.service';
import { SharedModule } from '@shared/shared.module';

import { AlertConfirmModule } from './component/alert-confirm/alert-confirm.module';
import { BlockViewComponent } from './component/block-view/block-view.component';
import { PopUpModule } from './component/pop-up/pop-up.module';
import { RouteLoadingComponent } from './component/route-loading/route-loading.component';
import { AuthGuard } from './guard/auth.guard';
import { ApiInterceptor } from './interceptor/api.interceptor';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { AuthService } from './service/auth.service';
import { BaseHttpService } from './service/base-http.service';
import { BaseService } from './service/base.service';
import { BlockViewService } from './service/block-view.service';
import { RouteLoadingService } from './service/route-loading.service';
import { UploadService } from './service/upload.service';
import { LoginStatusService } from './service/login-status.service';

@NgModule({
  imports: [
    SharedModule,
    PopUpModule.forRoot(),
    AlertConfirmModule.forRoot()
  ],
  declarations: [
    BlockViewComponent,
    RouteLoadingComponent
  ],
  entryComponents: [
    BlockViewComponent,
    RouteLoadingComponent
  ],
  providers: [
    BaseService,
    BaseHttpService,
    AuthService,
    BlockViewService,
    RouteLoadingService,
    UploadService,
    AuthGuard,
    CloudMessagingService,
    LoginStatusService,
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule, private matIconRegistry: MatIconRegistry) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
    this.matIconRegistry.registerFontClassAlias('icomoon', 'icon');
    // <mat-icon fontSet="icomoon" fontIcon="icon-google"></mat-icon>
  }
}
