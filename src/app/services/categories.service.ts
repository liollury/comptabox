import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, merge, mergeMap, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { CategoriesData } from '../models/categories.data';
import { Category } from '../models/category.model';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private categories$: Observable<Category[]>;

  constructor(private db: AngularFirestore) { }

  generateCategories() {
    //return;
    this.db.collection('categories').valueChanges({idField: 'documentId'}).pipe(
      take(1),
      switchMap((categories: any) => {
        return merge([of(null), ...categories.map((category) => this.db.doc(`categories/${category.documentId}`).delete())]);
      }),
      switchMap(() => {
        return CategoriesData.map((category) => {
          return from(this.db.collection('categories').add(category)).pipe(
            switchMap((docRef) => {
              // @ts-ignore
              return merge(category.subCategories.map((subCategory) => {
                return from(this.db.collection(`categories/${docRef.id}/subCategories`).add(subCategory));
              }));
            })
          )
        })
      })
    ).subscribe();
    /*CategoriesData.forEach((category) => {
      from(this.db.collection('categories').add(category)).pipe(
        switchMap((docRef) => {
          // @ts-ignore
          return merge(category.subCategories.map((subCategory) => {
            return from(this.db.collection(`categories/${docRef.id}/subCategories`).add(subCategory));
          }));
        })
      ).subscribe();
    });*/
  }

  getCategories(): Observable<Category[]> {
    if (!this.categories$) {
      this.categories$ = this.db.collection<Category>('categories').valueChanges().pipe(
        take(1),
        shareReplay(1)
      );
    }
    return this.categories$;
  }
}
