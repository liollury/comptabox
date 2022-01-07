import { Dayjs } from 'dayjs';
import { JsonProperty } from '@witty-services/ts-serializer';
import { FirestoreTimestampToDayjsConverter } from '../converters/firestore-timestamp-to-dayjs.converter';

export class Metadata {
  @JsonProperty({field: 'lastPlannedExecutionTimestamp', customConverter: () => FirestoreTimestampToDayjsConverter})
  lastPlannedExecution: Dayjs;

  constructor(partial: Partial<Metadata>) {
    Object.assign(this, partial);
  }
}
