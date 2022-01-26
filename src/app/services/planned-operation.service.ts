import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, from, map, merge, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { Operation, OperationStatus } from '../models/operation.model';
import { PlannedOperation } from '../models/planned-operation.model';
import { MetadataService } from './metadata.service';
import { AccountService } from './account.service';
import { Metadata } from '../models/metadata.model';
import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { NgxSerializerService } from '@witty-services/ngx-serializer';

@Injectable({
  providedIn: 'root'
})
export class PlannedOperationService {

  constructor(
    private db: AngularFirestore,
    private metadataService: MetadataService,
    private accountService: AccountService,
    private serializer: NgxSerializerService
  ) {
  }

  addPlannedOperation(documentId: string, operation: PlannedOperation): Observable<any> {
    operation.applyToAccountRef = documentId;
    return from(this.db.collection<Operation>(`plannedOperations`).add(this.serializer.serialize(operation)));
  }

  getPlannedOperations(): Observable<any> {
    return from(this.db.collection<Operation>(`plannedOperations`).valueChanges({idField: 'documentId'})).pipe(
      map((plannedOperationsObj: any[]) => this.serializer.deserializeAll(PlannedOperation, plannedOperationsObj)),
      shareReplay(1)
    );
  }

  updatePlannedOperation(operation: PlannedOperation): Observable<any> {
    return from(this.db.doc<Operation>(`plannedOperations/${operation.documentId}`).set(this.serializer.serialize(operation)));
  }

  deletePlannedOperation(operation: PlannedOperation): Observable<any> {
    return from(this.db.doc<Operation>(`plannedOperations/${operation.documentId}`).delete());
  }


  performPlannedOperations() {
    combineLatest([
      this.metadataService.getMetadata(),
      this.getPlannedOperations().pipe(take(1))
    ]).pipe(
      take(1),
      switchMap(([metadata, plannedOperations]: [Metadata, PlannedOperation[]]) => {
        if (!metadata || !plannedOperations || plannedOperations.length === 0) {
          return of(null);
        }
        const monthToTest = Math.ceil(dayjs().diff(metadata.lastPlannedExecution, 'month', true)) + 1;
        const today = dayjs();
        return merge(
          ...plannedOperations.map((plannedOperation: PlannedOperation) => {
            const adaptedPlannedOperationDate = plannedOperation.addToAccountAt.set('month', metadata.lastPlannedExecution.get('month'))
              .set('year', metadata.lastPlannedExecution.get('year'));
            let candidateDates: Dayjs[] = [];
            for (let i = 0; i < monthToTest; i++) {
              candidateDates.push(adaptedPlannedOperationDate.add(i, 'month'));
            }
            candidateDates = candidateDates.filter((candidateDate: Dayjs) => candidateDate.isBetween(metadata.lastPlannedExecution, today));
            return candidateDates.map((candidateDate: Dayjs) => {
              const operation = this.serializer.deserialize(Operation, this.serializer.serialize(plannedOperation));
              operation.status = OperationStatus.NOT_POINTED;
              operation.date = operation.date.set('month', candidateDate.month()).set('year', candidateDate.year());
              if (operation.date.isBefore(candidateDate)) {
                operation.date = operation.date.add(1, 'month');
              }
              console.log(operation);
              return from(this.accountService.addOperation(plannedOperation.applyToAccountRef, operation));
            });
          }).flat(),
          this.metadataService.updateLastPlannedExecution(today)
        );
      })
    ).subscribe();
  }
}
