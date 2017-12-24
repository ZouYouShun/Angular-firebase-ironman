export const RxViewer = {
  next: x => console.log(x),
  error: err => console.error('something wrong occurred: ' + err),
  complete: () => console.log('complete'),
};
