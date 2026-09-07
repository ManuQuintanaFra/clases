import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Crear Cuenta</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input id="email" type="email" formControlName="email" placeholder="tu@email.com">
          </div>

          <div class="form-group">
            <label for="password">Contraseña (Mínimo 6 caracteres)</label>
            <input id="password" type="password" formControlName="password" placeholder="******">
          </div>

          @if (successMessage()) {
            <div class="success-msg">{{ successMessage() }}</div>
          }

          @if (errorMessage()) {
            <div class="error-msg">{{ errorMessage() }}</div>
          }

          <button type="submit" [disabled]="registerForm.invalid || isLoading()">
            {{ isLoading() ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>
        
        <p class="auth-link">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; margin-top: 50px; }
    .auth-card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
    h2 { margin-top: 0; color: #333; text-align: center; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
    input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 10px; }
    button:disabled { background-color: #ccc; cursor: not-allowed; }
    .error-msg { color: #d9534f; background-color: #f9f2f2; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 14px; }
    .success-msg { color: #155724; background-color: #d4edda; border-color: #c3e6cb; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 14px; }
    .auth-link { text-align: center; margin-top: 15px; font-size: 14px; }
    .auth-link a { color: #0056b3; text-decoration: none; }
    .auth-link a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email, password } = this.registerForm.value;

    try {
      const { data, error } = await this.authService.signUp(email!, password!);
      if (error) throw error;
      
      // Si la confirmación de email está activa en Supabase, avisamos
      if (data.user?.identities?.length === 0) {
          this.errorMessage.set('Este email ya está registrado.');
      } else {
          this.successMessage.set('¡Registro exitoso! Por favor verifica tu email o inicia sesión.');
          this.registerForm.reset();
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error al registrarse');
    } finally {
      this.isLoading.set(false);
    }
  }
}
