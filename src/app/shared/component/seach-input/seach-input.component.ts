import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { StringHandler } from '@shared/ts/data/string.handler';
import { Observable } from 'rxjs/Observable';
import { AutoDestroy } from '@shared/ts/auto.destroy';

@Component({
  selector: 'app-seach-input',
  templateUrl: './seach-input.component.html',
  styleUrls: ['./seach-input.component.scss']
})
export class SeachInputComponent extends AutoDestroy implements OnInit, AfterViewInit {
  @Output() submit = new EventEmitter();
  @Output() clear = new EventEmitter();
  @ViewChild('input', { read: ElementRef }) input: ElementRef;

  active = false;
  constructor() {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    Observable.fromEvent(this.input.nativeElement, 'keyup')
      .debounceTime(500)
      .do((e: KeyboardEvent) => {
        if (e.keyCode !== 13) {
          console.log(e);
          this.onSubmit();
        }
      })
      .takeUntil(this._destroy$)
      .subscribe();
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
