import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EChartsOption } from 'echarts';
import { filter, map, Observable, Subject, switchMap, take, takeUntil, tap, zip } from 'rxjs';
import { Account, AccountTypeI18N } from '../../models/account.model';
import { Operation } from '../../models/operation.model';
import { AccountService } from '../../services/account.service';
import { generateLineChart, getChartInfos } from '../chart.utils';

@Component({
  selector: 'app-account-type-chart',
  templateUrl: './account-type-chart.component.html',
  styleUrls: ['../chart.common.scss', './account-type-chart.component.scss']
})
export class AccountTypeChartComponent implements OnInit {
  AccountTypeI18N = AccountTypeI18N;
  accounts: Account[] | undefined;
  accountType: 'account' | 'saving' | 'other';
  onDestroy$ = new Subject();

  options$: Observable<EChartsOption>;
  accountsNameMap: Map<string, string>;
  average: number;
  min: number;
  max: number;

  constructor(
    protected accountService: AccountService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.accountService.getAccounts().pipe(take(1)).subscribe((accounts) => {
      this.accountsNameMap = new Map(accounts.map((account) => [account.documentId, account.name]));
    });

    this.options$ = this.route.params.pipe(
      takeUntil(this.onDestroy$),
      filter((params: any) => !!params['type']),
      tap((params: any) => this.accountType = params['type']),
      switchMap(() => this.accountService.getAccounts()),
      map((accounts: Account[]) => accounts.filter((account: Account) => account.type === this.accountType)),
      tap((accounts: Account[]) => this.accounts = accounts),
      switchMap((accounts: Account[]) => zip(accounts.map((account: Account) => this.accountService.getAccountOperations(account)))),
      map((operations: Operation[][]) => operations.flat(1)),
      map((operations: Operation[]) => {
        const chartOption = generateLineChart(operations, this.accounts?.reduce((prev: number, curr: Account) => prev + curr.amount, 0) || 0);
        const {average, min, max} = getChartInfos(chartOption);
        this.average = Math.round(average);
        this.min = Math.round(min);
        this.max = Math.round(max);
        return chartOption;
      })
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(void 0);
    this.onDestroy$.complete();
  }
}
