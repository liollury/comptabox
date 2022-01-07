import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { JsonProperty } from '@witty-services/ts-serializer';
import { FirestoreTimestampToDayjsConverter } from '../converters/firestore-timestamp-to-dayjs.converter';

export enum OperationType {
  CB = 'CB',
  CHECK = 'CHECK',
  CASH = 'CASH',
  LEVY = 'LEVY',
  TRANSFER = 'TRANSFER',
};

export const OperationTypeI18N = {
  CB: 'Carte Bancaire',
  CHECK: 'Chèque',
  CASH: 'Cash',
  LEVY: 'Prélèvement',
  TRANSFER: 'Virement',
};

export enum OperationStatus {
  NOT_POINTED = 'NOT_POINTED',
  POINTED = 'POINTED',
  CLOSED = 'CLOSED',
}

export class Operation {
  @JsonProperty()
  documentId: string;

  @JsonProperty({field: 'timestampDate', customConverter: () => FirestoreTimestampToDayjsConverter})
  date: Dayjs;

  @JsonProperty()
  type: OperationType;

  @JsonProperty()
  amount: number;

  @JsonProperty()
  info: string;

  @JsonProperty()
  status: OperationStatus;

  @JsonProperty()
  category: number;

  @JsonProperty()
  subcategory: number;

  @JsonProperty()
  globalAmount: number;

  @JsonProperty()
  accountRef: string;

  @JsonProperty()
  operationRef: number;

  constructor(partial: Partial<Operation>) {
    Object.assign(this, partial);
    if (!this.operationRef) {
      this.operationRef = dayjs().unix();
    }
  }

}
