import { Injectable, inject } from '@angular/core';

import { Observable, delay } from 'rxjs';

import { ApiService } from '../api.service';
import { Customer } from '../app.model';

@Injectable({
  providedIn: 'root'
})
export class DelayService {

  private apiService = inject(ApiService);

}
