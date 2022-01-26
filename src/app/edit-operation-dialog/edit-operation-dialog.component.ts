import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Operation, OperationStatus, OperationType } from '../models/operation.model';
import * as dayjs from 'dayjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Category } from '../models/category.model';
import { PlannedOperation } from '../models/planned-operation.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-operation-dialog',
  templateUrl: './edit-operation-dialog.component.html',
  styleUrls: ['./edit-operation-dialog.component.scss']
})
export class EditOperationDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  categories: Category[];
  subCategories: Category[];
  prefilledSubCat: number | null;
  dialogData: {categories: Category[], operation: Operation, accounts: Map<string, string>, action: string};
  onDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<EditOperationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {categories: Category[], operation: Operation, accounts: Map<string, string>, action: string},
    private cdr: ChangeDetectorRef
  ) {
    this.categories = data.categories.sort((cat1: Category, cat2: Category) => cat1.name < cat2.name ? -1 : 1);
    this.dialogData = data;
  }

  get plannedFormControl(): FormControl {
    return this.form.controls['planned'] as FormControl;
  }

  ngOnInit(): void {
    this.subCategories = [];
    this.form = new FormGroup({
      date: new FormControl(dayjs(), [Validators.required]),
      type: new FormControl(OperationType.CB, [Validators.required]),
      status: new FormControl(OperationStatus.NOT_POINTED, [Validators.required]),
      amount: new FormControl(0, [Validators.required]),
      way: new FormControl('DEBIT', [Validators.required]),
      category: new FormControl(null),
      subcategory: new FormControl(null),
      accountRef: new FormControl(null),
      info: new FormControl(''),
      planned: new FormControl(false),
      addToAccountAt: new FormControl(dayjs(), [Validators.required]),
    });
    this.listenCategoryChange();
    this.listenPlannedChange();
    if (this.dialogData.operation) {
      this.prefilledSubCat = this.dialogData.operation.subcategory;
      this.form.patchValue({
        ...this.dialogData.operation,
        date: this.dialogData.operation.date,
        amount: Math.abs(this.dialogData.operation.amount),
        way: this.dialogData.operation.amount < 0 ? 'DEBIT': 'CREDIT',
        planned: this.dialogData.action === 'UPDATE_PLANNED'
      });
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  formatAmount() {
    const value: string = this.form.controls['amount'].value;
    if (parseFloat(value).toString(10) !== value) {
      this.form.controls['amount'].setValue(parseFloat(value).toString(10));
    }
  }

  listenCategoryChange() {
    this.form.controls['category'].valueChanges.subscribe((categoryId) => {
      this.form.controls['subcategory'].setValue(this.prefilledSubCat);
      this.prefilledSubCat = null;
      if (categoryId) {
        this.subCategories = this.categories.find((candidate) => candidate.id === categoryId)?.subCategories || [];
      } else {
        this.subCategories = [];
      }
    });
  }

  listenPlannedChange() {
    this.plannedFormControl.valueChanges.subscribe((value) => {
      if (value) {
        this.form.controls['addToAccountAt'].enable();
      } else {
        this.form.controls['addToAccountAt'].disable();
      }
      this.cdr.detectChanges();
    })
  }

  save() {
    if (this.form.valid) {
      const operation = this.form.value;
      operation.amount = Math.abs(parseFloat(operation.amount));
      if (operation.way === 'DEBIT') {
        operation.amount = -operation.amount;
      }
      delete operation.way;
      if (this.plannedFormControl.value) {
        delete operation.planned;
        this.dialogRef.close(new PlannedOperation(operation));
      } else {
        delete operation.planned;
        delete operation.addToAccountAt;
        this.dialogRef.close(new Operation(operation));
      }

    }
  }

}
