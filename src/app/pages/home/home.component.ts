import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly year = new Date().getFullYear();
  private revealObserver?: IntersectionObserver;

  /** Browsers block audible autoplay — enable sound after first user gesture. */
  private readonly enableHeroAudioOnInteraction = () => {
    const heroVideo = document.querySelector<HTMLVideoElement>('.ve-hero-video');
    if (!heroVideo) return;

    heroVideo.muted = false;
    heroVideo.volume = 0.25;
    void heroVideo.play().catch(() => undefined);

    window.removeEventListener('pointerdown', this.enableHeroAudioOnInteraction);
    window.removeEventListener('keydown', this.enableHeroAudioOnInteraction);
    window.removeEventListener('wheel', this.enableHeroAudioOnInteraction, { capture: true } as AddEventListenerOptions);
  };

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.router.navigate(['/admin'], { replaceUrl: true });
    }
  }

  ngAfterViewInit(): void {
    const heroVideo = document.querySelector<HTMLVideoElement>('.ve-hero-video');
    if (heroVideo) {
      // Autoplay is often blocked unless muted is set as a property.
      heroVideo.muted = true;
      heroVideo.volume = 0.25;
      heroVideo.playsInline = true;
      heroVideo.loop = true;

      const tryPlay = async () => {
        try {
          await heroVideo.play();
        } catch {
          // If autoplay is blocked, the first frame may show as an image.
          // User interaction (scroll/click) will usually allow playback.
        }
      };

      if (heroVideo.readyState >= 2) {
        void tryPlay();
      } else {
        heroVideo.addEventListener('canplay', () => void tryPlay(), { once: true });
      }

      window.addEventListener('pointerdown', this.enableHeroAudioOnInteraction, { passive: true });
      window.addEventListener('keydown', this.enableHeroAudioOnInteraction, { passive: true });
      window.addEventListener('wheel', this.enableHeroAudioOnInteraction, { passive: true, capture: true });
    }

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.ve-reveal'));
    if (!nodes.length) return;

    // No IntersectionObserver support: reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((el) => el.classList.add('ve-reveal--in'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).classList.add('ve-reveal--in');
          this.revealObserver?.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );

    nodes.forEach((el) => this.revealObserver?.observe(el));
  }

  ngOnDestroy(): void {
    window.removeEventListener('pointerdown', this.enableHeroAudioOnInteraction);
    window.removeEventListener('keydown', this.enableHeroAudioOnInteraction);
    window.removeEventListener('wheel', this.enableHeroAudioOnInteraction, { capture: true } as AddEventListenerOptions);

    this.revealObserver?.disconnect();
    this.revealObserver = undefined;
  }
}
