import { Injectable, inject } from '@angular/core';

import { ApiService } from '../api.service';
import { Observable, interval, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TakeService {

  private apiService = inject(ApiService);
  
}
