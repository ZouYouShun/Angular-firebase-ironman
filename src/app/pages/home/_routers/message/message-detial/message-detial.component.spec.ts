import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageDetialComponent } from './message-detial.component';

describe('MessageDetialComponent', () => {
  let component: MessageDetialComponent;
  let fixture: ComponentFixture<MessageDetialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageDetialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageDetialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
