import { Component, inject, OnInit } from '@angular/core';

import { AsyncSubject, BehaviorSubject, combineLatest, delay, finalize, map, Observable, ReplaySubject, Subject, tap, withLatestFrom } from 'rxjs';

import { ApiService } from '../api.service';
import { Customer, Jurisdiction } from '../app.model';
import { SubjectsContinuedService } from './subjects-continued.service';

interface UI {
  filteredCustomers: Customer[];
  searchText: string;
  selectedState: string;
  statesWithCustomers: Jurisdiction[];
  disableReset: boolean;
}

@Component({
  selector: 'app-subjects-continued',
  templateUrl: './subjects-continued.component.html',
  styleUrls: ['./subjects-continued.component.scss']
})
export class SubjectsContinuedComponent implements OnInit {

  private subjectsContinuedService: SubjectsContinuedService = inject(SubjectsContinuedService);

  ui$: Observable<UI> = combineLatest([
    this.subjectsContinuedService.filteredCustomers$,
    this.subjectsContinuedService.searchText$,
    this.subjectsContinuedService.selectedState$,
    this.subjectsContinuedService.statesWithCustomers$,
    this.subjectsContinuedService.disableReset$
  ]).pipe(
    map(([filteredCustomers, searchText, selectedState, statesWithCustomers, disableReset]) => {
      return {
        filteredCustomers,
        searchText,
        selectedState,
        statesWithCustomers,
        disableReset
      }
    })
  )

  ngOnInit(): void { }

  changeSearchText(event: any) {
    const searchText: string = (event.target.value as string).trim();
    this.subjectsContinuedService.changeSearchText(searchText);
  }

  changeState(event: any) {
    const selectedState: string = event.target.value;
    this.subjectsContinuedService.changeState(selectedState);
  }

  addCustomer() {
    this.subjectsContinuedService.createNewCustomer();
  }

  updateCustomer(customer: Customer) {
    this.subjectsContinuedService.editCustomerName(customer);
  }

  deleteCustomer(customer: Customer) {
    this.subjectsContinuedService.deleteCustomer(customer);
  }

  reset() {
    this.subjectsContinuedService.resetFilters();
  }

}
