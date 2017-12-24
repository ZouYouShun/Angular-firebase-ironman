import { Component } from '@angular/core';
import { BaseHttpService, ListHandler, DocumentHandler } from '@core/service/base-http.service';
import { RxViewer } from '@shared/ts/rx.viewer';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  menusHandler: ListHandler;
  menuHandler: DocumentHandler;
  menus$;
  menu$;
  constructor(private _http: BaseHttpService) {
    this.menusHandler = this._http.list('menus');
    this.menus$ = this.menusHandler.get({
      queryFn: ref => ref.orderByChild('updatedAt'),
      isKey: true
    });
  }

  add(value: string) {
    this.menusHandler.add({ title: value, value: value });
  }

  delete(message: any) {
    this.menusHandler.delete(message.key).subscribe(RxViewer);
  }

  updateItem(message: any, value?: string) {
    this.menusHandler.update(message.key, { title: value }).subscribe(RxViewer);
    message.update = false;
  }

  deleteEverything() {
    // this.numbersHandler.drop().subscribe(rxHandler);
  }

  choice(key) {
    this.menuHandler = this._http.document(`menus/${key}`);
  }

}
