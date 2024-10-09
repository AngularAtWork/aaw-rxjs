import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-json-show-card',
  templateUrl: './json-show-card.component.html',
  styleUrls: ['./json-show-card.component.scss']
})
export class JsonShowCardComponent implements OnInit {

  @Input()
  item!: string;

  ngOnInit(): void {
  }

}
