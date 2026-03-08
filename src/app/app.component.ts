import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Berry Angular Free Version';
  private loadingService = inject(LoadingService);
  isLoading = this.loadingService.isLoading;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (!sessionStorage.getItem('savaariUser')) {
      this.router.navigate(['/admin/login']);
    }
  }
}
