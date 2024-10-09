import { Injectable } from '@angular/core';

import { AsyncSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  private obsSubject = new AsyncSubject<string>();
  public obs$ = this.obsSubject.asObservable();

  emitMethod(message: string) {
    this.obsSubject.next(message);
  }

  completeMethod() {
    this.obsSubject.complete();
  }
}
