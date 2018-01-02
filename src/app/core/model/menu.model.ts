import { BaseModel } from '@core/model/base.model';

export interface MenuModel extends BaseModel {
  icon: string;
  url: string | string[] | { outlets: { [key: string]: string[] } }[];
  title: string;
}
