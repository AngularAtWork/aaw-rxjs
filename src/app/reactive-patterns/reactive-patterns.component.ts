import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { Customer, Jurisdiction } from '../app.model';
import { ReactivePatternsService } from './reactive-patterns.service';

export interface VM {
  allJurisdictions: Jurisdiction[];
  display: Jurisdiction;
  selectedJurisdiction: string;
}

@Component({
  selector: 'app-reactive-patterns',
  templateUrl: './reactive-patterns.component.html',
  styleUrls: ['./reactive-patterns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactivePatternsComponent implements OnInit {

  private reactivePatternsService = inject(ReactivePatternsService);

  allJurisdictions$: Observable<Jurisdiction[]> = this.reactivePatternsService.allJurisdictions$;
  display$: Observable<Jurisdiction> = this.reactivePatternsService.display$;
  selectedJurisdiction$: Observable<string> = this.reactivePatternsService.selectedJurisdiction$;

  vm$: Observable<VM> = combineLatest([
    this.reactivePatternsService.allJurisdictions$,
    this.reactivePatternsService.display$,
    this.reactivePatternsService.selectedJurisdiction$
  ]).pipe(
    map(([allJurisdictions, display, selectedJurisdiction]: [Jurisdiction[], Jurisdiction, string]) => {
      return {
        allJurisdictions,
        display,
        selectedJurisdiction
      }
    })
  )

  ngOnInit(): void {
  }

  changeJurisdictionSelection(evt: Event) {
    const selectedJurisdiction: string = (evt.target as HTMLInputElement).value;
    this.reactivePatternsService.notifyJurisdictionSelection(selectedJurisdiction);
  }

}
