import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, delay, filter, map } from 'rxjs';
import { ApiService } from '../api.service';
import { Jurisdiction } from '../app.model';
import { sortObs } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ReactivePatternsService {

  private apiService = inject(ApiService);

  private selectedJurisdictionSubject = new BehaviorSubject<string>('New York');
  public selectedJurisdiction$: Observable<string> = this.selectedJurisdictionSubject.asObservable();

  allJurisdictions$: Observable<Jurisdiction[]> = this.apiService.allJurisdictions$.pipe(
    delay(2000),
    sortObs('name')
  );

  display$: Observable<Jurisdiction> = combineLatest([
    this.allJurisdictions$,
    this.selectedJurisdiction$
  ]).pipe(
    delay(3000),
    map(([jurisdictions, selectedJurisdiction]: [Jurisdiction[], string]) => {
      return jurisdictions.filter((j: Jurisdiction) => j.name.toLocaleLowerCase() === selectedJurisdiction.toLocaleLowerCase())[0];
    }),
    map((jurisdiction: Jurisdiction) => ({...jurisdiction, name: jurisdiction?.name.toLocaleUpperCase()}))
  )
  
  notifyJurisdictionSelection(value: string) {
    this.selectedJurisdictionSubject.next(value);
  }
}
