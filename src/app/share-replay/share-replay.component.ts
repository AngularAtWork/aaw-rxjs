import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { Customer, Jurisdiction, TapCallback } from '../app.model';
import { ShareReplayService } from './share-replay.service';
import { log } from '../utils';

export interface ShareReplayVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
}

@Component({
  selector: 'app-share-replay',
  templateUrl: './share-replay.component.html',
  styleUrls: ['./share-replay.component.scss']
})
export class ShareReplayComponent implements OnInit {

  private shareReplayService = inject(ShareReplayService);

  vm$: Observable<ShareReplayVM> = combineLatest([
    this.shareReplayService.allJurisdictions$,
    this.shareReplayService.filteredCustomers$,
    this.shareReplayService.searchText$,
    this.shareReplayService.selectedJurisdiction$
  ]).pipe(
    map(([allJurisdictions, filteredCustomers, searchText, selectedJurisdiction]: [Jurisdiction[], Customer[], string, string]) => {
      return {
        allJurisdictions,
        filteredCustomers,
        searchText,
        selectedJurisdiction
      }
    }),
    log('vm$', TapCallback.Subscribe, '#8C92AC')
  )


  ngOnInit(): void {
  }

  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.shareReplayService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.shareReplayService.changeJurisdiction(jurisdiction);
  }

  addCustomer() {
    this.shareReplayService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.shareReplayService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.shareReplayService.deleteCustomer(evt);
  }

}
