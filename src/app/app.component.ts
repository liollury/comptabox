import { Component, OnInit } from '@angular/core';
import { PlannedOperationService } from './services/planned-operation.service';
import { AccountService } from './services/account.service';
import { Observable } from 'rxjs';
import { AccountGroup } from './models/account-group.interface';
import { AccountTypeI18N, AccountTypeIcon } from './models/account.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  AccountTypeI18N = AccountTypeI18N;
  AccountTypeIcon = AccountTypeIcon;
  accountGroups$: Observable<AccountGroup[]>;

  constructor(
    private plannedOperationService: PlannedOperationService,
    private accountService: AccountService
  ) {
  }

  ngOnInit(): void {
    this.plannedOperationService.performPlannedOperations();
    this.accountGroups$ = this.accountService.getAccountsGroupedByType();
  }

}
