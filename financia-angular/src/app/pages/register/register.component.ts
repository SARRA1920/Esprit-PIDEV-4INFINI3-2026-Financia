import {
  AfterViewInit,
  Component,
  inject,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', Validators.required],
    address: [''],
    monthlyIncome: [''],
  });

  error = '';
  loading = false;

  readonly googleClientId = environment.googleClientId?.trim() ?? '';
  readonly googleEnabled = !!this.googleClientId;

  private googleInitTimer: ReturnType<typeof setInterval> | null = null;

  ngAfterViewInit(): void {
    this.scheduleGoogleButton();
  }

  ngOnDestroy(): void {
    if (this.googleInitTimer != null) {
      clearInterval(this.googleInitTimer);
      this.googleInitTimer = null;
    }
  }

  private scheduleGoogleButton(): void {
    if (!this.googleEnabled) return;
    let attempts = 0;
    this.googleInitTimer = setInterval(() => {
      attempts++;
      const g = window.google?.accounts?.id;
      const host = document.getElementById('google-signin-button-register');
      if (g && host) {
        if (this.googleInitTimer != null) {
          clearInterval(this.googleInitTimer);
          this.googleInitTimer = null;
        }
        g.initialize({
          client_id: this.googleClientId,
          callback: (res: { credential: string }) => {
            this.zone.run(() => this.onGoogleCredential(res.credential));
          },
          auto_select: false,
        });
        g.renderButton(host, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signup_with',
          locale: 'fr',
        });
      } else if (attempts > 80) {
        if (this.googleInitTimer != null) {
          clearInterval(this.googleInitTimer);
          this.googleInitTimer = null;
        }
      }
    }, 100);
  }

  private onGoogleCredential(idToken: string): void {
    this.error = '';
    this.loading = true;
    this.auth.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/espace-client']);
      },
      error: (e: Error) => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const incRaw = String(v.monthlyIncome ?? '').trim();
    let monthlyIncome: number | null = null;
    if (incRaw !== '') {
      const n = Number(incRaw);
      if (!Number.isFinite(n) || n < 0) {
        this.error = 'Indiquez un revenu mensuel valide (≥ 0) ou laissez vide.';
        return;
      }
      monthlyIncome = n;
    }

    this.loading = true;
    this.error = '';
    this.auth
      .register({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        password: v.password,
        phone: v.phone,
        address: v.address,
        role: 'CLIENT',
        monthlyIncome,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/espace-client']);
        },
        error: (e: Error) => {
          this.error = e.message;
          this.loading = false;
        },
      });
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void;
        };
      };
    };
  }
}
