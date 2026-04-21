import {
  AfterViewInit,
  Component,
  inject,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly zone = inject(NgZone);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  error = '';
  loading = false;
  faceLoading = false;

  /** Même Client ID que `google.oauth.client-id` dans Spring (Console Google Cloud). */
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

  /** Attend le chargement du script GSI puis affiche le bouton Google. */
  private scheduleGoogleButton(): void {
    if (!this.googleEnabled) return;
    let attempts = 0;
    this.googleInitTimer = setInterval(() => {
      attempts++;
      const g = window.google?.accounts?.id;
      const host = document.getElementById('google-signin-button');
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
          text: 'signin_with',
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

  private postLoginNavigate(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const u = this.auth.user();
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      this.router.navigateByUrl(returnUrl);
      return;
    }
    if (u?.role === 'ADMIN') {
      this.router.navigate(['/admin']);
      return;
    }
    this.router.navigate(['/espace-client']);
  }

  private onGoogleCredential(idToken: string): void {
    this.error = '';
    this.loading = true;
    this.auth.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.loading = false;
        this.postLoginNavigate();
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
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.postLoginNavigate();
      },
      error: (e: Error) => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  triggerFaceCapture(): void {
    const email = this.form.controls.email.value?.trim();
    if (!email) {
      this.error = 'Indiquez d’abord votre e-mail pour la connexion Face ID.';
      this.form.controls.email.markAsTouched();
      return;
    }
    document.getElementById('face-capture-input')?.click();
  }

  onFaceFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const email = this.form.controls.email.value?.trim();
    if (!email) {
      this.error = 'E-mail requis.';
      return;
    }

    this.faceLoading = true;
    this.error = '';
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      this.auth.loginWithFace(email, data).subscribe({
        next: () => {
          this.faceLoading = false;
          this.postLoginNavigate();
        },
        error: (e: Error) => {
          this.error = e.message;
          this.faceLoading = false;
        },
      });
    };
    reader.onerror = () => {
      this.faceLoading = false;
      this.error = 'Lecture du fichier impossible.';
    };
    reader.readAsDataURL(file);
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
