import { Pipe, PipeTransform } from '@angular/core';
import { StringHandler } from '../ts/data/string.handler';

@Pipe({
  name: 'message'
})
export class MessagePipe implements PipeTransform {

  transform(value: any, cla?: string): any {
    return new StringHandler(value)
      .hrefToAnchor(cla)
      .toString();
  }
}
