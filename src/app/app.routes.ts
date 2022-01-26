import { Route, Routes } from '@angular/router';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountComponent } from './account/account.component';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { LoginComponent } from './login/login.component';
import { redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { PlannedOperationListComponent } from './planned-operation-list/planned-operation-list.component';

const accountList: Route = {
  path: 'list',
  component: AccountListComponent,
  canActivate: [AngularFireAuthGuard],
  data: {
    authGuardPipe: () => redirectUnauthorizedTo(['login'])
  }
};

const account: Route = {
  path: 'account/:id',
  component: AccountComponent,
  canActivate: [AngularFireAuthGuard],
  data: {
    authGuardPipe: () => redirectUnauthorizedTo(['login'])
  }
};

const plannedOperationList: Route = {
  path: 'planned-operations',
  component: PlannedOperationListComponent,
  canActivate: [AngularFireAuthGuard],
  data: {
    authGuardPipe: () => redirectUnauthorizedTo(['login'])
  }
};

const login: Route = {
  path: 'login',
  component: LoginComponent,
  canActivate: [AngularFireAuthGuard],
  data: {
    authGuardPipe: () => redirectLoggedInTo(['list'])
  }
};

const defaultRoute: Route = {
  path: '**',
  redirectTo: '/list'
};

export const routes: Routes = [accountList, plannedOperationList, account, login, defaultRoute];
