import { Account } from './account.model';

export interface AccountGroup {
  type: string;
  accounts: Account[];
}
