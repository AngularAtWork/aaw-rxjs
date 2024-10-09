import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-card',
  templateUrl: './show-card.component.html',
  styleUrls: ['./show-card.component.scss']
})
export class ShowCardComponent implements OnInit {

  @Input()
  item: any;

  constructor() { }

  ngOnInit(): void {
  }

}
