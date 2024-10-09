import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { Customer } from '../app.model';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {

  private mapService = inject(MapService);

  customers$: Observable<any[]> = this.mapService.displayCustomers$;

  ngOnInit(): void {
    this.customers$.subscribe({
      next: value => console.log(value)
    })
  }
}
