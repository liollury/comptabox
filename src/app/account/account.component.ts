import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs';
import { Account } from '../models/account.model';
import { Operation, OperationStatus, OperationTypeI18N } from '../models/operation.model';
import { MatDialog } from '@angular/material/dialog';
import { EditOperationDialogComponent } from '../edit-operation-dialog/edit-operation-dialog.component';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../models/category.model';
import { CloseOperationDialogComponent } from '../close-operation-dialog/close-operation-dialog.component';
import { floatHack } from '../utils/number.util';
import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { PlannedOperation } from '../models/planned-operation.model';
import { PlannedOperationService } from '../services/planned-operation.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

class OperationFilter {
  pointedOperationFilter = false;
  monthToShow = 4;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  OperationStatus = OperationStatus;
  OperationTypeI18N = OperationTypeI18N;
  displayedColumns = ['date', 'description', 'type', 'amount', 'pointed', 'globalAmount', 'actions'];
  account: Account | undefined;
  accountDocumentId: string;
  operations$: Observable<Operation[]>;
  categories: Category[] = [];
  accountsNameMap: Map<string, string>;
  onDestroy$ = new Subject();
  pointedAmount: number;
  theoricalAmount: number;
  closedAmount: number;
  months: Dayjs[] = [];
  filter: OperationFilter = new OperationFilter();
  filter$: BehaviorSubject<OperationFilter> = new BehaviorSubject<OperationFilter>(this.filter);

  constructor(
    protected accountService: AccountService,
    private categoriesService: CategoriesService,
    private plannedOperationService: PlannedOperationService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // this.categoriesService.generateCategories();
    this.categoriesService.getCategories().subscribe((categories) => this.categories = categories);
    this.accountService.getAccounts().pipe(take(1)).subscribe((accounts) => {
      this.accountsNameMap = new Map(accounts.map((account) => [account.documentId, account.name]));
    });
    // @ts-ignore
    this.operations$ = this.route.params.pipe(
      takeUntil(this.onDestroy$),
      filter((params: any) => !!params['id']),
      tap((params: any) => this.accountDocumentId = params['id']),
      switchMap((params: any) => this.accountService.getAccount(params.id)),
      tap((account: Account | undefined) => this.account = account),
      switchMap((account: Account | undefined) => combineLatest([account ? this.accountService.getAccountOperations(account): of([]), this.filter$])),
      tap(([operations, filter]: [Operation[], OperationFilter]) => this.calculatePointedAmount(operations)),
      tap(([operations, filter]: [Operation[], OperationFilter]) => this.calculateTheoricalAmount(operations)),
      tap(([operations, filter]: [Operation[], OperationFilter]) => this.calculateClosedAmount(operations)),
      tap(([operations, filter]: [Operation[], OperationFilter]) => this.computedMonths(operations, filter)),
      switchMap(([operations, filter]: [Operation[], OperationFilter]) => {
        const filteredOperations = this.filterOperation(operations, filter);
          if (this.account?.pointedAmount !== this.pointedAmount || this.account?.theoricalAmount !== this.theoricalAmount) {
            return this.accountService.updateAccountAmounts(this.accountDocumentId, this.pointedAmount, this.theoricalAmount).pipe(map(() => filteredOperations))
          } else {
            return of(filteredOperations);
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(void 0);
    this.onDestroy$.complete();
  }

  filterOperation(operations: Operation[], filter: OperationFilter): Operation[] {
    if (filter.pointedOperationFilter) {
      return operations.filter((operation: Operation) => operation.status === OperationStatus.NOT_POINTED);
    }
    return operations;
  }

  computedMonths(operations: Operation[], filter: OperationFilter) {
    this.months = Array.from(new Set(operations.map((operation) => operation.date.format('01-MM-YYYY'))))
      .map((date: string) => dayjs(date, 'DD-MM-YYYY'));
    if (!filter.pointedOperationFilter) {
      this.months = this.months.slice(0, filter.monthToShow);
    }
  }

  calculatePointedAmount(operations: Operation[]) {
    this.pointedAmount = operations.filter((operation) => operation.status !== OperationStatus.NOT_POINTED)
        .reduce((acc, curr) => acc + curr.amount, this.account?.amount || 0);
  }

  calculateTheoricalAmount(operations: Operation[]) {
    const nextMonth = dayjs().startOf('month').add(1, 'month');
    this.theoricalAmount = operations.filter((operation) => operation.date.isBefore(nextMonth))
      .reduce((acc, curr) => acc + curr.amount, this.account?.amount || 0);
  }

  calculateClosedAmount(operations: Operation[]) {
    this.closedAmount = operations.filter((operation) => operation.status === OperationStatus.CLOSED)
      .reduce((acc, curr) => acc + curr.amount, this.account?.amount || 0);
  }

  getCategory(operation: Operation): string {
    return Operation.formatCategory(operation, this.categories);
  }

  closeOperationDialog() {
    const dialogRef = this.dialog.open(CloseOperationDialogComponent, {
      data: {
        amount: this.pointedAmount,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((realAmount) => {
      if (realAmount && floatHack(realAmount) === floatHack(this.pointedAmount)) {
        this.accountService.closeOperations(this.accountDocumentId).subscribe();
      }
    });
  }

  patchFilter() {
    this.filter$.next(this.filter);
  }

  openOperationDialog(action: 'CREATE' | 'UPDATE' | 'CLONE', referenceOperation?: Operation): void {
    const dialogRef = this.dialog.open(EditOperationDialogComponent, {
      panelClass: 'fullWidthForMobile',
      data: {
        categories: this.categories,
        accounts: this.accountsNameMap,
        operation: referenceOperation,
        action
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((operation: Operation | PlannedOperation) => {
      if (operation) {
        if (action === 'UPDATE') {
          this.accountService.updateOperation(this.accountDocumentId, operation, referenceOperation).subscribe();
        } else if (operation instanceof PlannedOperation) {
          this.plannedOperationService.addPlannedOperation(this.accountDocumentId, operation).subscribe();
        } else if (operation instanceof Operation) {
          this.accountService.addOperation(this.accountDocumentId, operation).subscribe();
        }
      }
    });
  }

  toggleStatus(operation: Operation) {
    if (operation.status === OperationStatus.POINTED) {
      operation.status = OperationStatus.NOT_POINTED;
    } else {
      operation.status = OperationStatus.POINTED;
    }
    this.accountService.updateOperation(this.accountDocumentId, operation).subscribe();
  }

  cloneOperation(operation: Operation) {
    this.openOperationDialog('CLONE', operation);
  }

  editOperation(operation: Operation) {
    this.openOperationDialog('UPDATE', operation);
  }

  deleteOperation(operation: Operation) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      panelClass: 'fullWidthForMobile'
    });
    dialogRef.afterClosed().subscribe((isYes: boolean) => {
      if (isYes) {
        this.accountService.deleteOperation(this.accountDocumentId, operation);
      }
    });
  }

  operationForMonth(operations: Operation[], month: Dayjs) {
    return operations.filter((operation) => operation.date.month() === month.month() && operation.date.year() === month.year());
  }

}
