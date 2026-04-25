import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  error = '';
  loading = false;
  /** Après envoi réussi : message neutre (sans révéler si l’e-mail existe). */
  done = false;

  submit(): void {
    this.error = '';
    const ctrl = this.form.controls.email;
    ctrl.setValue((ctrl.value ?? '').trim(), { emitEvent: false });
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.forgotPassword(ctrl.value).subscribe({
      next: () => {
        this.loading = false;
        this.done = true;
      },
      error: (e: Error) => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }
}
