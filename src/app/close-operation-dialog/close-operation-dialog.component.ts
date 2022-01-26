import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-close-operation-dialog',
  templateUrl: './close-operation-dialog.component.html',
  styleUrls: ['./close-operation-dialog.component.scss']
})
export class CloseOperationDialogComponent implements OnInit {
  realAmount: string;

  constructor(
    private dialogRef: MatDialogRef<CloseOperationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {amount: number}
  ) {
  }

  ngOnInit(): void {
  }

  confirm() {
    this.dialogRef.close(parseFloat(this.realAmount));
  }

  cancel() {
    this.dialogRef.close();
  }

  formatAmount() {
    if (parseFloat(this.realAmount).toString(10) !== this.realAmount) {
      this.realAmount = parseFloat(this.realAmount).toString(10);
    }
  }

}
