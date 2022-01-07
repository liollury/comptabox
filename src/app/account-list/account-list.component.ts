import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { map, Observable } from 'rxjs';
import { Account, AccountTypeI18N } from '../models/account.model';

interface AccountGroup {
  type: string;
  accounts: Account[];
}

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
    this.accountGroups$ = this.accountService.getAccounts().pipe(
      map((accounts: Account[]) => {
        return accounts.reduce((acc: AccountGroup[], account: Account) => {
          let group = acc.find((acc: AccountGroup) => acc.type === account.type);
          if (!group) {
            group = {
              type: account.type,
              accounts: []
            };
            acc.push(group);
          }
          group.accounts.push(account);
          return acc;
        }, [] as AccountGroup[])
      })
    );
  }

  getPointedTotal(group: AccountGroup): number {
    return group.accounts.reduce((acc, curr) => acc + curr.pointedAmount, 0);
  }

  getTheoricalTotal(group: AccountGroup): number {
    return group.accounts.reduce((acc, curr) => acc + curr.theoricalAmount, 0);
  }
}
