import { Component, OnInit, inject } from '@angular/core';

import { Observable, finalize, of } from 'rxjs';

import { FinalizeService } from './finalize.service';


@Component({
  selector: 'app-finalize',
  templateUrl: './finalize.component.html',
  styleUrls: ['./finalize.component.scss']
})
export class FinalizeComponent implements OnInit {

  private finalizeService = inject(FinalizeService);

  ngOnInit(): void { }
}
