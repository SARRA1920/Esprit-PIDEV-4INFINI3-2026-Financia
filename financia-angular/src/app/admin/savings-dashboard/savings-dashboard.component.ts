import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavingsService } from '../../core/savings.service';

@Component({
  selector: 'app-savings-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './savings-dashboard.component.html',
  styleUrls: ['./savings-dashboard.component.scss'],
})
export class SavingsDashboardComponent implements OnInit {
  private readonly savings = inject(SavingsService);

  readonly stats = signal<any>(null);
  readonly statsError = signal('');

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.statsError.set('');
    this.savings.getSystemStatistics().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => this.statsError.set(err.message),
    });
  }
}
