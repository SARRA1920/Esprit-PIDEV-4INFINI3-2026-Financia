import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AuthResponse, RegisterRequest } from '../../models/auth.models';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  address = '';
  /** Affiché seulement en UI — pas dans `RegisterRequest` côté API actuellement */
  monthlyIncome: number | null = null;
  password = '';
  authError = '';
  mobileOpen = false;
  faceMode: 'none' | 'camera' = 'none';

  readonly heroBg = '/assets/financia-theme/img/bg-img/23.jpg';

  @ViewChild('faceVideo') faceVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('faceCanvas') faceCanvas?: ElementRef<HTMLCanvasElement>;

  private faceStream: MediaStream | null = null;
  private lastFaceDataUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    void this.initGoogleSignIn();
  }

  ngOnDestroy(): void {
    this.stopFaceCamera();
  }

  submitRegister(): void {
    this.authError = '';
    const payload: RegisterRequest = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
      phone: this.phone.trim(),
      address: this.address.trim() || null,
      role: null,
      facePhotoBase64: this.lastFaceDataUrl,
    };

    this.authService.register(payload).subscribe({
      next: (res) => void this.afterAuthSuccess(res, !!this.lastFaceDataUrl),
      error: (err: unknown) => {
        this.authError = this.httpErrorMessage(err);
      },
    });
  }

  private afterAuthSuccess(res: AuthResponse, hadFacePhoto: boolean): void {
    this.persistAuth(res);
    if (hadFacePhoto && res.token) {
      this.authService.faceEnroll(this.lastFaceDataUrl!).subscribe({
        next: () => void this.router.navigateByUrl('/home'),
        error: () => void this.router.navigateByUrl('/home'),
      });
      return;
    }
    void this.router.navigateByUrl('/home');
  }

  private persistAuth(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('currentUser', JSON.stringify(res.user));
  }

  private httpErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { error?: string } | string | null;
      if (typeof body === 'object' && body && 'error' in body && body.error) {
        return body.error;
      }
      return err.message || "Échec de l'inscription";
    }
    return "Échec de l'inscription";
  }

  private async initGoogleSignIn(): Promise<void> {
    const clientId = environment.googleClientId?.trim();
    if (!clientId) {
      return;
    }
    await this.loadScript('https://accounts.google.com/gsi/client');
    const el = document.getElementById('google-signin-button-register');
    if (!el || !window.google?.accounts?.id) {
      return;
    }
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        this.authError = '';
        this.authService.googleLogin(response.credential).subscribe({
          next: (res) => {
            this.persistAuth(res);
            void this.router.navigateByUrl('/home');
          },
          error: (err: unknown) => {
            this.authError = this.httpErrorMessage(err);
          },
        });
      },
    });
    window.google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
      shape: 'pill',
    });
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Impossible de charger ' + src));
      document.head.appendChild(s);
    });
  }

  onFaceFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.lastFaceDataUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async startFaceCamera(): Promise<void> {
    this.authError = '';
    if (!isPlatformBrowser(this.platformId) || !navigator.mediaDevices?.getUserMedia) {
      this.authError = 'Caméra non supportée.';
      return;
    }
    try {
      this.stopFaceCamera();
      this.faceStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      const v = this.faceVideo?.nativeElement;
      if (v) {
        v.srcObject = this.faceStream;
        await v.play();
      }
    } catch {
      this.authError = 'Accès caméra refusé ou indisponible.';
    }
  }

  captureFace(): void {
    const video = this.faceVideo?.nativeElement;
    const canvas = this.faceCanvas?.nativeElement;
    if (!video || !canvas || !video.videoWidth) {
      this.authError = 'Démarrez la caméra avant de capturer.';
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.lastFaceDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  }

  stopFaceCamera(): void {
    if (this.faceStream) {
      this.faceStream.getTracks().forEach((t) => t.stop());
      this.faceStream = null;
    }
    const v = this.faceVideo?.nativeElement;
    if (v) {
      v.srcObject = null;
    }
  }
}
