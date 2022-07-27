import { redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { Route, Routes } from '@angular/router';
import { AccountChartComponent } from './account-chart/account-chart.component';
import { AccountTypeChartComponent } from './account-type-chart/account-type-chart.component';

const accountList: Route = {
  path: 'account-chart/:id',
  component: AccountChartComponent,
  canActivate: [AngularFireAuthGuard],
  data: {
    authGuardPipe: () => redirectUnauthorizedTo(['login'])
  }
};

const accountType: Route = {
  path: 'account-type-chart/:type',
  component: AccountTypeChartComponent,
  canActivate: [AngularFireAuthGuard],
  data: {
    authGuardPipe: () => redirectUnauthorizedTo(['login'])
  }
};

export const routes: Routes = [accountList, accountType];
