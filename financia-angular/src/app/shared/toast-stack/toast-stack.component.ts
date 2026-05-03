import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  template: `
    <div class="ve-toast-stack" aria-live="polite">
      @for (t of toast.items(); track t.id) {
        <button type="button" class="ve-toast" [class.ve-toast--success]="t.type === 'success'" [class.ve-toast--warn]="t.type === 'warn'" (click)="toast.dismiss(t.id)">
          {{ t.message }}
        </button>
      }
    </div>
  `,
  styles: `
    .ve-toast-stack {
      position: fixed;
      bottom: 22px;
      right: 22px;
      z-index: 10050;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: min(420px, calc(100vw - 32px));
      pointer-events: none;
    }
    .ve-toast {
      pointer-events: auto;
      text-align: left;
      border: 1px solid rgba(15, 23, 42, 0.12);
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 0.92rem;
      font-weight: 650;
      cursor: pointer;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.95));
      box-shadow: 0 18px 44px rgba(15, 23, 42, 0.14);
      color: #0f172a;
    }
    .ve-toast--success {
      border-color: rgba(34, 197, 94, 0.35);
      background: linear-gradient(180deg, rgba(240, 253, 244, 0.98), rgba(236, 253, 245, 0.94));
    }
    .ve-toast--warn {
      border-color: rgba(245, 158, 11, 0.45);
      background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(254, 243, 199, 0.92));
    }
  `,
})
export class ToastStackComponent {
  readonly toast = inject(ToastService);
}
