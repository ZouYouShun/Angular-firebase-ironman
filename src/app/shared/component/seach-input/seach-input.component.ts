import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { StringHandler } from '@shared/ts/data/string.handler';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

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
    fromEvent(this.input.nativeElement, 'keyup').pipe(
      debounceTime(500),
      tap((e: KeyboardEvent) => {
        if (e.keyCode !== 13) {
          this.onSubmit();
        }
      }),
      takeUntil(this._destroy$)
    ).subscribe();
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
