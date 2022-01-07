import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Operation } from '../models/operation.model';

@Component({
  selector: 'app-close-operation-dialog',
  templateUrl: './close-operation-dialog.component.html',
  styleUrls: ['./close-operation-dialog.component.scss']
})
export class CloseOperationDialogComponent implements OnInit {
  realAmount: number;

  constructor(
    private dialogRef: MatDialogRef<CloseOperationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {amount: number}
  ) {
  }

  ngOnInit(): void {
  }

  confirm() {
    this.dialogRef.close(this.realAmount);
  }

  cancel() {
    this.dialogRef.close();
  }

}
