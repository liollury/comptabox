import { Route, Routes } from '@angular/router';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountComponent } from './account/account.component';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { LoginComponent } from './login/login.component';
import { redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

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

export const routes: Routes = [accountList, account, login, defaultRoute];
