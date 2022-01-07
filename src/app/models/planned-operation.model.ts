import { Operation } from './operation.model';
import { Dayjs } from 'dayjs';
import { JsonProperty } from '@witty-services/ts-serializer';
import { FirestoreTimestampToDayjsConverter } from '../converters/firestore-timestamp-to-dayjs.converter';


export class PlannedOperation extends Operation {
  @JsonProperty()
  applyToAccountRef: string;

  @JsonProperty({field: 'addToAccountAtDate', customConverter: () => FirestoreTimestampToDayjsConverter})
  addToAccountAt: Dayjs;

  constructor(partial: Partial<PlannedOperation>) {
    super(partial);
    Object.assign(this, partial);
  }
}
