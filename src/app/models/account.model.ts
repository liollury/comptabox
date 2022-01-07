import { JsonProperty } from '@witty-services/ts-serializer';

export const AccountTypeI18N = {
  account: 'Mes comptes',
  saving: 'Mon épargne',
  other: 'Autre',
};

export class Account {
  @JsonProperty()
  documentId: string;

  @JsonProperty()
  name: string;

  @JsonProperty()
  type: 'account' | 'saving' | 'other';

  @JsonProperty()
  amount: number;

  @JsonProperty()
  pointedAmount: number;

  @JsonProperty()
  theoricalAmount: number;
}
