import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Account } from '../models/account.model';
import { Operation, OperationStatus, OperationTypeI18N } from '../models/operation.model';
import { MatDialog } from '@angular/material/dialog';
import { EditOperationDialogComponent } from '../edit-operation-dialog/edit-operation-dialog.component';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../models/category.model';
import { CloseOperationDialogComponent } from '../close-operation-dialog/close-operation-dialog.component';
import { floatHack } from '../utils/number.util';
import { Dayjs } from 'dayjs';
import * as dayjs from 'dayjs';
import { PlannedOperation } from '../models/planned-operation.model';
import { PlannedOperationService } from '../services/planned-operation.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  OperationStatus = OperationStatus;
  OperationTypeI18N = OperationTypeI18N;
  displayedColumns = ['date', 'description', 'type', 'amount', 'pointed', 'globalAmount', 'actions'];
  accountDocumentId: string;
  operations$: Observable<Operation[]>;
  categories: Category[];
  accountsNameMap: Map<string, string>;
  onDestroy$ = new Subject();
  pointedAmount: number;
  theoricalAmount: number;
  accountAmount: number;
  closedAmount: number;
  months: Dayjs[] = [];

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
    this.accountDocumentId = this.route.snapshot.params['id'];
    this.accountService.getAccounts().pipe(take(1)).subscribe((accounts) => {
      this.accountsNameMap = new Map(accounts.map((account) => [account.documentId, account.name]));
    });
    this.operations$ = this.accountService.getAccount(this.accountDocumentId).pipe(
      takeUntil(this.onDestroy$),
      tap((account: Account | undefined) => this.accountAmount = account?.amount || 0),
      switchMap((account: Account | undefined) => account ? this.accountService.getAccountOperations(account): of([])),
      tap((operations: Operation[]) => this.calculatePointedAmount(operations)),
      tap((operations: Operation[]) => this.calculateTheoricalAmount(operations)),
      tap((operations: Operation[]) => this.calculateClosedAmount(operations)),
      tap((operations: Operation[]) => this.computedMonths(operations)),
      switchMap((operations: Operation[]) =>
        this.accountService.updateAccountAmounts(this.accountDocumentId, this.pointedAmount, this.theoricalAmount).pipe(map(() => operations))
      )
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(void 0);
    this.onDestroy$.complete();
  }

  computedMonths(operations: Operation[]) {
    this.months = Array.from(new Set(operations.map((operation) => operation.date.format('01-MM-YYYY'))))
      .map((date: string) => dayjs(date, 'DD-MM-YYYY'));
    this.months = this.months.slice(0, 4);
  }

  calculatePointedAmount(operations: Operation[]) {
    this.pointedAmount = operations.filter((operation) => operation.status !== OperationStatus.NOT_POINTED)
        .reduce((acc, curr) => acc + curr.amount, this.accountAmount);
  }

  calculateTheoricalAmount(operations: Operation[]) {
    const nextMonth = dayjs().startOf('month').add(1, 'month');
    this.theoricalAmount = operations.filter((operation) => operation.date.isBefore(nextMonth))
      .reduce((acc, curr) => acc + curr.amount, this.accountAmount);
  }

  calculateClosedAmount(operations: Operation[]) {
    this.closedAmount = operations.filter((operation) => operation.status === OperationStatus.CLOSED)
      .reduce((acc, curr) => acc + curr.amount, this.accountAmount);
  }

  getCategory(operation: Operation): string {
    let categoryString = '';
    if (operation.category) {
      const category = this.categories.find((category) => category.id === operation.category);
      categoryString = category?.name || '';
      if (operation.subcategory && category) {
        const subCategory = category.subCategories?.find((subCategory) => operation.subcategory === subCategory.id);
        if (subCategory) {
          categoryString = subCategory.name;
        }
      }
    }
    return categoryString;
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

  openOperationDialog(action: 'CREATE' | 'UPDATE' | 'CLONE', referenceOperation?: Operation): void {
    const dialogRef = this.dialog.open(EditOperationDialogComponent, {
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
    this.accountService.deleteOperation(this.accountDocumentId, operation);
  }

  operationForMonth(operations: Operation[], month: Dayjs) {
    return operations.filter((operation) => operation.date.month() === month.month() && operation.date.year() === month.year());
  }

}
