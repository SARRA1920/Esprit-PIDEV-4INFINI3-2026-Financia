import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warn';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly _items = signal<ToastItem[]>([]);
  readonly items = this._items.asReadonly();

  show(message: string, type: ToastType = 'info', durationMs = 4200): void {
    const id = ++this.seq;
    this._items.update((list) => [...list, { id, message, type }]);
    window.setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this._items.update((list) => list.filter((t) => t.id !== id));
  }
}
