import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { map, Observable } from 'rxjs';
import { Account, AccountTypeI18N } from '../models/account.model';
import { AccountGroup } from '../models/account-group.interface';



@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {
  AccountTypeI18N = AccountTypeI18N;
  accountGroups$: Observable<AccountGroup[]>;

  constructor(
    protected accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.accountGroups$ = this.accountService.getAccountsGroupedByType();
  }

  getPointedTotal(group: AccountGroup): number {
    return group.accounts.reduce((acc, curr) => acc + curr.pointedAmount, 0);
  }

  getTheoricalTotal(group: AccountGroup): number {
    return group.accounts.reduce((acc, curr) => acc + curr.theoricalAmount, 0);
  }
}
