import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { StringHandler } from '@shared/ts/data/string.handler';

@Component({
  selector: 'app-seach-input',
  templateUrl: './seach-input.component.html',
  styleUrls: ['./seach-input.component.scss']
})
export class SeachInputComponent implements OnInit {
  @Output() submit = new EventEmitter();
  @Output() clear = new EventEmitter();
  @ViewChild('input', { read: ElementRef }) input: ElementRef;

  active = false;
  constructor() { }

  ngOnInit() {
  }

  search(state = true) {
    this.active = state;
    if (!state) {
      this.clear.emit();
      this.input.nativeElement.value = '';
    } else {
      this.input.nativeElement.focus();
    }
  }

  onSubmit() {
    this.submit.next(this.input.nativeElement.value);
  }

  blur() {
    if (new StringHandler(this.input.nativeElement.value).isEmpty()) {
      this.active = false;
    }
  }

}
