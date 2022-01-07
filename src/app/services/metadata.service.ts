import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, map, Observable, shareReplay, take } from 'rxjs';
import { Metadata } from '../models/metadata.model';
import { NgxSerializerService } from '@witty-services/ngx-serializer';
import { Dayjs } from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private metadata$: Observable<Metadata>;

  constructor(
    private db: AngularFirestore,
    private serializer: NgxSerializerService
  ) { }

  getMetadata(): Observable<Metadata> {
    if (!this.metadata$) {
      this.metadata$ = this.db.collection<Metadata>('metadata').valueChanges().pipe(
        map((metadata: any[]) => this.serializer.deserialize(Metadata, metadata[0])),
        shareReplay(1)
      );
    }
    return this.metadata$;
  }

  updateLastPlannedExecution(date: Dayjs): Observable<any> {
    return from(this.db.doc(`metadata/metadata`).update({
      lastPlannedExecutionTimestamp: date.toDate()
    }));
  }
}
