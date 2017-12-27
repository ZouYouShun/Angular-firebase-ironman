import { Observable } from 'rxjs/Observable';

export function loadImgObserable(imagePath: string): Observable<string> {
  return Observable
    .create(observer => {
      const img = new Image();
      img.src = imagePath;
      img.onload = () => {
        observer.next(imagePath);
        observer.complete();
      };
      img.onerror = err => {
        observer.error(null);
      };
    });
}
