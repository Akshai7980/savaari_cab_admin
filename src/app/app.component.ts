import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Berry Angular Free Version';

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!localStorage.getItem('savaariUser')) {
      this.router.navigate(['/admin/login']);
    }
  }
}
