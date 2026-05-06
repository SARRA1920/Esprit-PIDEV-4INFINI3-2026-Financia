import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  cameraAccessErrorMessage,
  captureVideoFrameAsJpegDataUrl,
  startUserFacingCamera,
  stopMediaStream,
} from '../../core/face-capture';
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

  /** Caméra pour connexion Face ID */
  faceCameraActive = false;
  private faceLoginStream: MediaStream | null = null;

  /** Même Client ID que `google.oauth.client-id` dans Spring (Console Google Cloud). */
  readonly googleClientId = environment.googleClientId?.trim() ?? '';
  readonly googleEnabled = !!this.googleClientId;

  private googleInitTimer: ReturnType<typeof setInterval> | null = null;

  /** Hôte du bouton Google Identity Services (évite getElementById avant le rendu du @if). */
  private readonly googleBtnHost =
    viewChild<ElementRef<HTMLElement>>('googleHost');

  /** Affiche un message si le script GSI n’a pas pu rendre le bouton (bloqueur, réseau, timeout). */
  googleRenderFailed = false;

  ngAfterViewInit(): void {
    /* Attend le prochain tick pour que #googleHost (@if) soit bien dans le DOM. */
    setTimeout(() => this.scheduleGoogleButton(), 0);
  }

  ngOnDestroy(): void {
    if (this.googleInitTimer != null) {
      clearInterval(this.googleInitTimer);
      this.googleInitTimer = null;
    }
    this.closeFaceLoginCamera();
  }

  /** Attend le chargement du script GSI puis affiche le bouton Google. */
  private scheduleGoogleButton(): void {
    if (!this.googleEnabled) return;
    this.googleRenderFailed = false;
    let attempts = 0;
    const maxAttempts = 180;

    this.googleInitTimer = setInterval(() => {
      attempts++;
      const host = this.googleBtnHost()?.nativeElement;
      const g = window.google?.accounts?.id;

      if (g && host) {
        if (this.googleInitTimer != null) {
          clearInterval(this.googleInitTimer);
          this.googleInitTimer = null;
        }

        const width = Math.min(320, host.getBoundingClientRect().width || 320);

        try {
          try {
            g.initialize({
              client_id: this.googleClientId,
              callback: (res: { credential: string }) => {
                this.zone.run(() => this.onGoogleCredential(res.credential));
              },
              auto_select: false,
            });
          } catch {
            /* Navigation SPA : GSI peut refuser une 2ᵉ init ; renderButton suffit souvent. */
          }
          host.innerHTML = '';
          g.renderButton(host, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width,
            text: 'signin_with',
            locale: 'fr',
          });
        } catch {
          this.zone.run(() => {
            this.googleRenderFailed = true;
          });
        }
      } else if (attempts >= maxAttempts) {
        if (this.googleInitTimer != null) {
          clearInterval(this.googleInitTimer);
          this.googleInitTimer = null;
        }
        this.zone.run(() => {
          this.googleRenderFailed = true;
        });
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

  async openFaceLoginCamera(): Promise<void> {
    const email = this.form.controls.email.value?.trim();
    if (!email) {
      this.error = 'Indiquez d’abord votre e-mail pour la connexion Face ID.';
      this.form.controls.email.markAsTouched();
      return;
    }
    this.error = '';
    this.closeFaceLoginCamera();
    this.faceCameraActive = true;
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
    const video = document.getElementById(
      'face-login-video'
    ) as HTMLVideoElement | null;
    if (!video) {
      this.faceCameraActive = false;
      this.error = 'Élément vidéo introuvable.';
      return;
    }
    try {
      this.faceLoginStream = await startUserFacingCamera(video);
    } catch (e) {
      this.faceCameraActive = false;
      this.faceLoginStream = null;
      video.srcObject = null;
      this.error = cameraAccessErrorMessage(e);
    }
  }

  captureFaceLoginAndAuthenticate(): void {
    const email = this.form.controls.email.value?.trim();
    if (!email) {
      this.error = 'E-mail requis.';
      return;
    }
    const video = document.getElementById(
      'face-login-video'
    ) as HTMLVideoElement | null;
    if (!video) {
      this.error = 'Caméra non disponible.';
      return;
    }
    const data = captureVideoFrameAsJpegDataUrl(video);
    if (!data) {
      this.error =
        'Image pas encore prête. Attendez que l’aperçu caméra s’affiche, puis réessayez.';
      return;
    }

    this.faceLoading = true;
    this.error = '';
    this.auth.loginWithFace(email, data).subscribe({
      next: () => {
        this.faceLoading = false;
        this.closeFaceLoginCamera();
        this.postLoginNavigate();
      },
      error: (e: Error) => {
        this.error = e.message;
        this.faceLoading = false;
      },
    });
  }

  closeFaceLoginCamera(): void {
    stopMediaStream(this.faceLoginStream);
    this.faceLoginStream = null;
    this.faceCameraActive = false;
    const video = document.getElementById(
      'face-login-video'
    ) as HTMLVideoElement | null;
    if (video) {
      video.srcObject = null;
    }
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
