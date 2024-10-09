import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { OfService } from './of.service';

@Component({
  selector: 'app-of',
  templateUrl: './of.component.html',
  styleUrls: ['./of.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfComponent implements OnInit {

  private ofService = inject(OfService);

  item$: Observable<any> = of('A', null, 4);

  ngOnInit(): void {
    this.item$.subscribe({
      next: value => console.log(value),
      complete: () => console.log('COMPLETED')
    })
  }
}
