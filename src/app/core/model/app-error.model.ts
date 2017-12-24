import { ErrorHandler } from '@angular/core';

export class AppError {
  constructor(public originalError?: any) {
  }
}

export class NotFoundError extends AppError {
  constructor() {
    super();
  }
}


export class BadError extends AppError {
}

export class AppErrorHandler implements ErrorHandler {
  handleError(error) {
    alert('An unexpected error');
  }
}
