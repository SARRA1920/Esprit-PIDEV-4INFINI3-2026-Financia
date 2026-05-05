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
import { AuthResponse } from '../../models/auth.models';
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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  email = '';
  password = '';
  authError = '';
  mobileOpen = false;
  faceMode: 'none' | 'camera' = 'none';

  readonly heroBg = '/assets/financia-theme/img/bg-img/22.jpg';

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

  login(): void {
    this.authError = '';
    this.authService
      .login({
        email: this.email.trim(),
        password: this.password,
        country: null,
      })
      .subscribe({
        next: (res: AuthResponse) => this.persistAuth(res),
        error: (err: unknown) => {
          this.authError = this.httpErrorMessage(err);
        },
      });
  }

  private persistAuth(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('currentUser', JSON.stringify(res.user));
    void this.router.navigateByUrl('/home');
  }

  private httpErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { error?: string } | string | null;
      if (typeof body === 'object' && body && 'error' in body && body.error) {
        return body.error;
      }
      return err.message || 'Échec de la connexion';
    }
    return 'Échec de la connexion';
  }

  private async initGoogleSignIn(): Promise<void> {
    const clientId = environment.googleClientId?.trim();
    if (!clientId) {
      return;
    }
    await this.loadScript('https://accounts.google.com/gsi/client');
    const el = document.getElementById('google-signin-button');
    if (!el || !window.google?.accounts?.id) {
      return;
    }
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        this.authError = '';
        this.authService.googleLogin(response.credential).subscribe({
          next: (res) => this.persistAuth(res),
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

  async startFaceCamera(): Promise<void> {
    this.authError = '';
    if (!isPlatformBrowser(this.platformId) || !navigator.mediaDevices?.getUserMedia) {
      this.authError = 'Caméra non supportée sur ce navigateur.';
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

  submitFaceLogin(): void {
    this.authError = '';
    const mail = this.email.trim();
    if (!mail) {
      this.authError = 'Renseignez votre email pour le login Face ID.';
      return;
    }
    if (!this.lastFaceDataUrl) {
      this.authError = 'Capturez une image avant de valider.';
      return;
    }
    this.authService.faceVerify(mail, this.lastFaceDataUrl).subscribe({
      next: (res) => this.persistAuth(res),
      error: (err: unknown) => {
        this.authError = this.httpErrorMessage(err);
      },
    });
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

  onFaceFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.authError = '';
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      this.lastFaceDataUrl = data;
      this.submitFaceLogin();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }
}
