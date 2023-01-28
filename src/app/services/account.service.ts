import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Account } from '../models/account.model';
import { from, map, merge, Observable, of, shareReplay, switchMap, take, tap } from 'rxjs';
import { Operation, OperationStatus } from '../models/operation.model';
import { NgxSerializerService } from '@witty-services/ngx-serializer';
import { AccountGroup } from '../models/account-group.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private accounts$: Observable<Account[]>;

  constructor(
    private db: AngularFirestore,
    private serializer: NgxSerializerService
  ) { }

  addAccount(account: Account): Observable<any> {
    return from(this.db.collection('accounts').add(this.serializer.serialize(account)));
  }

  getAccounts(): Observable<Account[]> {
    if (!this.accounts$) {
      this.accounts$ = this.db.collection<Account>('accounts').valueChanges({idField: 'documentId'}).pipe(
        map((accountsObj: any[]) => this.serializer.deserializeAll(Account, accountsObj)),
        map((accounts: Account[]) => accounts.sort((acc1: Account, acc2: Account) => acc1.name > acc2.name ? 1: -1)),
        shareReplay(1)
      );
    }
    return this.accounts$;
  }

  getAccountsGroupedByType(): Observable<AccountGroup[]> {
    const typeOrder = ['account', 'saving', 'other'];
    return this.getAccounts().pipe(
      map((accounts: Account[]) => {
        return accounts.reduce((acc: AccountGroup[], account: Account) => {
          let group = acc.find((acc: AccountGroup) => acc.type === account.type);
          if (!group) {
            group = {
              type: account.type,
              accounts: []
            };
            acc.push(group);
          }
          group.accounts.push(account);
          return acc;
        }, [] as AccountGroup[]).sort((acc1: AccountGroup, acc2: AccountGroup) => typeOrder.indexOf(acc1.type) > typeOrder.indexOf(acc2.type) ? 1 : -1)
      })
    );
  }

  getAccount(documentId: string): Observable<Account | undefined> {
    return this.getAccounts().pipe(
      map((accounts: Account[]) => accounts.find((account) => account.documentId === documentId)),
      take(1)
    );
  }

  updateAccountAmounts(documentId: string, pointedAmount: number, theoricalAmount: number): Observable<void> {
    return from(
      this.db.doc(`accounts/${documentId}`).update({
        pointedAmount,
        theoricalAmount
      })
    ).pipe(take(1));
  }

  getAccountOperations(account: Account): Observable<Operation[]> {
    return this.db.collection<Operation>(`accounts/${account.documentId}/operations`).valueChanges({idField: 'documentId'}).pipe(
      map((operations) => {
        const sortedOperations = this.serializer.deserializeAll(Operation, operations)
          .sort((op1: Operation, op2: Operation) => op1.date.isBefore(op2.date) ? 1: -1);
        this.computeGlobalAmount(account.amount, sortedOperations);
        return sortedOperations;
      })
    );/*.subscribe((operations: Operation[]) => {
      operations.forEach((operation) => {
        if (operation.timestamp) {
          from(this.db.doc(`accounts/${account.documentId}/operations/${operation.documentId}`).update({
            timestampDate: dayjs.unix(operation.timestamp).toDate(),
            timestamp: deleteField()
          })).subscribe();
        }
      });
    });*/

   // return of([]);
  }

  private computeGlobalAmount(baseAmount: number, operations: Operation[]) {
    let previousAmount = baseAmount;
    operations.slice().reverse().forEach((operation) => {
      operation.globalAmount = previousAmount + operation.amount;
      previousAmount = operation.globalAmount;
    })
  }

  addOperation(documentId: string, operation: Operation) {
    const obs = [from(this.db.collection<Operation>(`accounts/${documentId}/operations`).add(this.serializer.serialize(operation)))];
    if (operation.accountRef) {
      const reverseOperation = new Operation(operation);
      const reverseDocumentId = operation.accountRef;
      reverseOperation.amount = -reverseOperation.amount;
      reverseOperation.accountRef = documentId;
      obs.push(from(this.db.collection<Operation>(`accounts/${reverseDocumentId}/operations`).add(this.serializer.serialize(reverseOperation))))
    }
    return merge(obs);
  }

  updateOperation(documentId: string, operation: Operation, oldOperation?: Operation): Observable<any> {
    if (oldOperation) {
      return this.deleteOperation(documentId, oldOperation).pipe(
        switchMap(() => this.addOperation(documentId, operation))
      );
    } else {
      return from(this.db.doc<Operation>(`accounts/${documentId}/operations/${operation.documentId}`).set(this.serializer.serialize(operation)));
    }
  }

  deleteOperation(documentId: string, operation: Operation): Observable<any> {
    return from(this.db.doc<Operation>(`accounts/${documentId}/operations/${operation.documentId}`).delete()).pipe(
      switchMap(() => {
        if (operation.accountRef) {
          return this.db.collection(
            `accounts/${operation.accountRef}/operations`,
              ref => ref.where('operationRef', '==', operation.operationRef)
          ).get().pipe(
            switchMap((operations) => {
              return merge([of(null), ...operations.docs.map((operation) => from(operation.ref.delete()))]);
            })
          );
        } else {
          return of(null);
        }
      }),
      take(1)
    );
  }

  closeOperations(documentId: string): Observable<any> {
    return this.db.collection(
      `accounts/${documentId}/operations`,
      ref => ref.where('status', '==', OperationStatus.POINTED)
    ).get().pipe(
      switchMap((operations) => {
        const ids = operations.docs.map((operation) => operation.id);
        return merge([of(null), ...ids.map((id) => this.db.doc(`accounts/${documentId}/operations/${id}`).update({status: OperationStatus.CLOSED}))]);
      })
    )
  }

}
