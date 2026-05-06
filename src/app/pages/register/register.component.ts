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
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  cameraAccessErrorMessage,
  captureVideoFrameAsJpegDataUrl,
  startUserFacingCamera,
  stopMediaStream,
} from '../../core/face-capture';
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

  /** Jeton Google conservé entre l’étape profil et la soumission du formulaire. */
  pendingGoogleIdToken: string | null = null;
  /** Après validation Google : prénom/nom/e-mail préremplis, le reste à saisir. */
  googleSignupPending = false;

  /** Photo enregistrée pour Face ID (data URL JPEG capturée depuis la caméra). */
  facePhotoBase64: string | null = null;

  /** Flux MediaStream actif (caméra ouverte). */
  faceStream: MediaStream | null = null;
  cameraActive = false;

  readonly googleClientId = environment.googleClientId?.trim() ?? '';
  readonly googleEnabled = !!this.googleClientId;

  private googleInitTimer: ReturnType<typeof setInterval> | null = null;

  private readonly googleBtnHost =
    viewChild<ElementRef<HTMLElement>>('googleHostRegister');

  googleRenderFailed = false;

  ngAfterViewInit(): void {
    setTimeout(() => this.scheduleGoogleButton(), 0);
  }

  ngOnDestroy(): void {
    if (this.googleInitTimer != null) {
      clearInterval(this.googleInitTimer);
      this.googleInitTimer = null;
    }
    this.closeCamera();
  }

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
            /* SPA : 2ᵉ visite possible */
          }
          host.innerHTML = '';
          g.renderButton(host, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width,
            text: 'signup_with',
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

  private onGoogleCredential(idToken: string): void {
    this.error = '';
    this.loading = true;
    this.auth.googleProfile(idToken).subscribe({
      next: (profile) => {
        this.pendingGoogleIdToken = idToken;
        this.googleSignupPending = true;
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
        });
        this.form.controls.firstName.clearValidators();
        this.form.controls.lastName.clearValidators();
        this.form.controls.email.clearValidators();
        this.form.controls.firstName.updateValueAndValidity({ emitEvent: false });
        this.form.controls.lastName.updateValueAndValidity({ emitEvent: false });
        this.form.controls.email.updateValueAndValidity({ emitEvent: false });
        this.loading = false;
      },
      error: (e: Error) => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  cancelGoogleSignup(): void {
    this.pendingGoogleIdToken = null;
    this.googleSignupPending = false;
    this.form.patchValue({ firstName: '', lastName: '', email: '' });
    this.form.controls.firstName.setValidators(Validators.required);
    this.form.controls.lastName.setValidators(Validators.required);
    this.form.controls.email.setValidators([Validators.required, Validators.email]);
    this.form.controls.firstName.updateValueAndValidity({ emitEvent: false });
    this.form.controls.lastName.updateValueAndValidity({ emitEvent: false });
    this.form.controls.email.updateValueAndValidity({ emitEvent: false });
  }

  async openCamera(): Promise<void> {
    this.error = '';
    this.closeCamera();
    this.cameraActive = true;
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
    const video = document.getElementById(
      'face-register-video'
    ) as HTMLVideoElement | null;
    if (!video) {
      this.cameraActive = false;
      this.error = 'Élément vidéo introuvable.';
      return;
    }
    try {
      this.faceStream = await startUserFacingCamera(video);
    } catch (e) {
      this.cameraActive = false;
      this.faceStream = null;
      video.srcObject = null;
      this.error = cameraAccessErrorMessage(e);
    }
  }

  captureFromCamera(): void {
    const video = document.getElementById(
      'face-register-video'
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
    this.facePhotoBase64 = data;
    this.closeCamera();
  }

  closeCamera(): void {
    stopMediaStream(this.faceStream);
    this.faceStream = null;
    this.cameraActive = false;
    const video = document.getElementById(
      'face-register-video'
    ) as HTMLVideoElement | null;
    if (video) {
      video.srcObject = null;
    }
  }

  clearFacePhoto(): void {
    this.closeCamera();
    this.facePhotoBase64 = null;
  }

  submit(): void {
    this.error = '';
    const emailCtrl = this.form.controls.email;
    emailCtrl.setValue((emailCtrl.value ?? '').trim(), { emitEvent: false });

    if (this.pendingGoogleIdToken) {
      if (this.form.controls.phone.invalid || this.form.controls.password.invalid) {
        this.form.markAllAsTouched();
        this.error =
          'Téléphone et mot de passe (≥ 6 caractères) sont obligatoires pour finaliser l’inscription.';
        return;
      }
      const v = this.form.getRawValue();
      const phone = (v.phone ?? '').trim();
      if (!phone) {
        this.error = 'Le téléphone est obligatoire.';
        return;
      }
      if (!v.password || v.password.length < 6) {
        this.error = 'Mot de passe : au moins 6 caractères.';
        return;
      }
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
      this.auth
        .registerWithGoogle({
          idToken: this.pendingGoogleIdToken,
          phone,
          address: (v.address ?? '').trim(),
          password: v.password,
          role: 'CLIENT',
          monthlyIncome,
          facePhotoBase64: this.facePhotoBase64 ?? undefined,
        })
        .subscribe({
          next: () => {
            this.loading = false;
            this.pendingGoogleIdToken = null;
            this.googleSignupPending = false;
            this.router.navigate(['/espace-client']);
          },
          error: (e: Error) => {
            this.error = e.message;
            this.loading = false;
          },
        });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error =
        'Vérifiez les champs obligatoires (prénom, nom, e-mail valide, téléphone, mot de passe ≥ 6 caractères).';
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
        facePhotoBase64: this.facePhotoBase64 ?? undefined,
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
