import { Route, Routes } from '@angular/router';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountComponent } from './account/account.component';

const accountList: Route = {
  path: 'list',
  component: AccountListComponent
};

const account: Route = {
  path: 'account/:id',
  component: AccountComponent
};

const defaultRoute: Route = {
  path: '**',
  redirectTo: '/list'
};

export const routes: Routes = [accountList, account, defaultRoute];
