import { Injectable, inject } from '@angular/core';

import { Observable, delay, interval, take } from 'rxjs';

import { ApiService } from '../api.service';
import { Customer } from '../app.model';

@Injectable({
  providedIn: 'root'
})
export class IntervalService {

  private apiService = inject(ApiService);

}
