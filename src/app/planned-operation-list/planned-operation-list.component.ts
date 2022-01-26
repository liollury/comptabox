import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlannedOperationService } from '../services/planned-operation.service';
import { AccountService } from '../services/account.service';
import { Observable, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Category } from '../models/category.model';
import { CategoriesService } from '../services/categories.service';
import { PlannedOperation } from '../models/planned-operation.model';
import { Operation, OperationTypeI18N } from '../models/operation.model';
import { EditOperationDialogComponent } from '../edit-operation-dialog/edit-operation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Account } from '../models/account.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-planned-operation-list',
  templateUrl: './planned-operation-list.component.html',
  styleUrls: ['./planned-operation-list.component.scss']
})
export class PlannedOperationListComponent implements OnInit, OnDestroy {
  OperationTypeI18N = OperationTypeI18N;
  displayedColumns = ['date', 'dateToApply', 'description', 'type', 'amount', 'account', 'actions'];
  categories: Category[] = [];
  accountsNameMap: Map<string, string>;
  operations$: Observable<PlannedOperation[]>;
  onDestroy$ = new Subject();

  constructor(
    private categoriesService: CategoriesService,
    private accountService: AccountService,
    private plannedOperationService: PlannedOperationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.operations$ = this.categoriesService.getCategories().pipe(
      tap((categories) => this.categories = categories),
      switchMap(() => this.accountService.getAccounts()),
      tap((accounts: Account[]) => this.accountsNameMap = new Map(accounts.map((account) => [account.documentId, account.name]))),
      switchMap(() => this.plannedOperationService.getPlannedOperations())
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(void 0);
    this.onDestroy$.complete();
  }

  getCategory(operation: PlannedOperation): string {
    return Operation.formatCategory(operation, this.categories);
  }

  editOperation(operation: PlannedOperation) {
    this.openOperationDialog(operation);
  }

  deleteOperation(operation: PlannedOperation) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      panelClass: 'fullWidthForMobile'
    });
    dialogRef.afterClosed().subscribe((isYes: boolean) => {
      if (isYes) {
        this.plannedOperationService.deletePlannedOperation(operation).subscribe();
      }
    });
  }


  openOperationDialog(referenceOperation: PlannedOperation): void {
    const dialogRef = this.dialog.open(EditOperationDialogComponent, {
      panelClass: 'fullWidthForMobile',
      data: {
        categories: this.categories,
        accounts: this.accountsNameMap,
        operation: referenceOperation,
        action: 'UPDATE_PLANNED'
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((operation: PlannedOperation) => {
      if (operation) {
        Object.assign(referenceOperation, operation);
        delete referenceOperation.operationRef;
        this.plannedOperationService.updatePlannedOperation(referenceOperation).subscribe();
      }
    });
  }
}
