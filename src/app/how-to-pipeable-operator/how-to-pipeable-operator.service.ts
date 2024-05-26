import { Injectable, inject } from '@angular/core';

import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class HowToPipeableOperatorService {

  private apiService = inject(ApiService);

}
