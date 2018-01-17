import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-show-date',
  templateUrl: './show-date.component.html',
  styleUrls: ['./show-date.component.scss']
})
export class ShowDateComponent implements OnInit {
  @Input() date: Date;
  @Input() zero: Date;
  @Input() type: string;

  constructor() { }

  ngOnInit() {
  }

}
