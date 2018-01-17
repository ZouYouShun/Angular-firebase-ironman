import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'shortDate'
})
export class ShortDatePipe extends DatePipe implements PipeTransform {

  transform(date: string, zero: string, type?: string): any {
    let format = 'HH:mm';
    if (date <= zero) {
      if (type === 'full') {
        format = 'yyyy/MM/dd HH:mm';
      } else {
        format = 'yyyy/MM/dd';
      }
    }
    return super.transform(new Date(date), format);
  }

}
