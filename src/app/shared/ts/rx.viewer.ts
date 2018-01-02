export const RxViewer = {
  next: x => console.log(x),
  error: err => console.error(err),
  complete: () => console.log('complete'),
};
