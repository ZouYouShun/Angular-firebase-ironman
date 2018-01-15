import { BaseModel } from '@core/model/base.model';

export interface FileModel extends BaseModel {
  path: string;
  contentType: string;
  url: string;
  thumbnail: string;
}
