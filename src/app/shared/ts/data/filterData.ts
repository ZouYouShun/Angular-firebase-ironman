import * as _ from 'lodash';

export class FilterData {
  filters = {};
  constructor(private data: any) { }
  applyFilters() {
    return _.filter(this.data, _.conforms(this.filters));
  }
  /// filter property by equality to rule
  filterExact(property: string, rule: any) {
    this.filters[property] = val => val === rule;
    return this.applyFilters();
  }
  /// filter  numbers greater than rule
  filterGreaterThan(property: string, rule: number) {
    this.filters[property] = val => val > rule;
    return this.applyFilters();
  }
  /// filter properties that resolve to true
  filterBoolean(property: string, rule: boolean) {
    if (!rule) return this.removeFilter(property);
    else {
      this.filters[property] = val => val;
      return this.applyFilters();
    }
  }
  /// removes filter
  removeFilter(property: string) {
    delete this.filters[property];
    this[property] = null;
    return this.applyFilters();
  }
}
