import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AccountListComponent } from './account-list/account-list.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AccountComponent } from './account/account.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import { EditOperationDialogComponent } from './edit-operation-dialog/edit-operation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { APP_DATE_FORMATS, DayjsDateAdapter } from './mat-dayjs-date-formats';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';

import localeFr from '@angular/common/locales/fr';
import { CloseOperationDialogComponent } from './close-operation-dialog/close-operation-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { AppDatePipe } from './pipe/date.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxSerializerModule } from '@witty-services/ngx-serializer';
import { LoginComponent } from './login/login.component';
import { AngularFireAuthModule, PERSISTENCE } from '@angular/fire/compat/auth';
import { MatSidenavModule } from '@angular/material/sidenav';

registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    AccountListComponent,
    AccountComponent,
    EditOperationDialogComponent,
    CloseOperationDialogComponent,
    AppDatePipe,
    LoginComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSerializerModule.forRoot(),
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFireAuthModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatSidenavModule
  ],
  providers: [
    {
      provide: PERSISTENCE,
      useValue: 'local'
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'fr-FR'
    },
    {
      provide: DateAdapter,
      useClass: DayjsDateAdapter,
      deps: [MAT_DATE_LOCALE, Platform]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'EUR'
    },
    {
      provide: LOCALE_ID,
      useValue: 'fr'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
