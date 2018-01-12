import { Pipe, PipeTransform } from '@angular/core';
import { brToSpace } from '../ts/data/replaceToBr';

@Pipe({
  name: 'brToSpace'
})
export class BrToSpacePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return brToSpace(value);
  }

}
