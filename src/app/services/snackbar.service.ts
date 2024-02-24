import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private readonly snackBar: MatSnackBar) {}

  showMessage(
    message: string,
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    verticalPosition: MatSnackBarVerticalPosition = 'top',
    duration: number = 5000
  ) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition,
      verticalPosition,
      duration
    });
  }
}
