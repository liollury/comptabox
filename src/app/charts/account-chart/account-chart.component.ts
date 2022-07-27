import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EChartsOption } from 'echarts';
import { filter, map, Observable, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Account } from '../../models/account.model';
import { Operation } from '../../models/operation.model';
import { AccountService } from '../../services/account.service';
import { generateLineChart, getChartInfos } from '../chart.utils';

@Component({
  selector: 'app-account-chart',
  templateUrl: './account-chart.component.html',
  styleUrls: ['../chart.common.scss', './account-chart.component.scss']
})
export class AccountChartComponent implements OnInit {

  account: Account | undefined;
  accountDocumentId: string;
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
      filter((params: any) => !!params['id']),
      tap((params: any) => this.accountDocumentId = params['id']),
      switchMap((params: any) => this.accountService.getAccount(params.id)),
      tap((account: Account | undefined) => this.account = account),
      switchMap((account: Account) => this.accountService.getAccountOperations(account)),
      map((operations: Operation[]) => {
        const chartOption = generateLineChart(operations, this.account?.amount || 0);
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
