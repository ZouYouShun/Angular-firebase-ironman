import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatToolbarModule,
  MatTabsModule,
  MatIconRegistry,
} from '@angular/material';

const myMaterialModul = [
  MatToolbarModule,
  MatIconModule,
  MatSidenavModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatListModule,
  MatButtonModule,

  MatSlideToggleModule,
  MatSelectModule,
  MatInputModule,
  MatCheckboxModule,

  MatRadioModule,
  MatRippleModule,
  MatTabsModule,
  // MatChipsModule,
  // MatCardModule,
  // MatGridListModule
];

@NgModule({
  imports: myMaterialModul,
  exports: myMaterialModul,
})
export class MyMaterialModuleModule {}
