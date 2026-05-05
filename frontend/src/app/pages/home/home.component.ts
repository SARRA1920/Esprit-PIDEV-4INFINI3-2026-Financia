import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  user: AuthUser | null = null;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (u) => {
        this.user = u as AuthUser;
      },
      error: () => {
        this.error = 'Session invalide ou expirée.';
      },
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    void this.router.navigateByUrl('/login');
  }
}
