import { Injectable, inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { BehaviorSubject, Observable, finalize, merge, of, tap, zip } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class LoadingService {

  private spinner = inject(NgxSpinnerService);

  indicateWhenDone(startingObservables: Observable<any>[], endingObservables: Observable<any>[]): Observable<any> {

    const start = merge(...startingObservables).pipe(tap(() => this.loadingOn()));
    const end = zip(...endingObservables).pipe(tap(() => this.loadingOff()));

    return merge(start, end).pipe(
      finalize(() => this.loadingOff())
    );
  }

  loadingOn() {
    console.log('loadingOn called');
      this.spinner.show();
  }

  loadingOff() {
    console.log('loadingOff called');
      this.spinner.hide();
  }
}
