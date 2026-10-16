import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { mensajeDeError } from '../../core/util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-fondo">
      <form class="tarjeta login" (ngSubmit)="ingresar()">
        <h1>🏠 Control Hogar</h1>
        <p class="sub">Ingresa con tu correo y contraseña</p>

        <div class="error" *ngIf="error">{{ error }}</div>

        <label for="correo">Correo</label>
        <input id="correo" type="email" [(ngModel)]="correo" name="correo"
               required placeholder="tucorreo@ejemplo.com">

        <label for="contrasena">Contraseña</label>
        <input id="contrasena" type="password" [(ngModel)]="contrasena"
               name="contrasena" required placeholder="••••••••">

        <button type="submit" [disabled]="cargando" style="width:100%">
          {{ cargando ? 'Ingresando...' : 'Ingresar' }}
        </button>

        <p class="nota">
          ¿Aún no tienes cuenta? Regístrate desde la API con
          <code>POST /api/usuarios</code> (por ejemplo, en Thunder Client).
        </p>
      </form>
    </div>
  `,
  styles: [`
    .login-fondo {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4472c4, #1f3864);
    }
    .login {
      width: 360px;
      max-width: 92vw;
    }
    .login h1 {
      text-align: center;
    }
    .sub {
      text-align: center;
      color: #64748b;
      margin-top: 0;
    }
    .nota {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 0;
    }
  `]
})
export class LoginComponent {

  private auth = inject(AuthService);
  private router = inject(Router);

  correo = '';
  contrasena = '';
  error = '';
  cargando = false;

  ingresar(): void {
    this.error = '';
    this.cargando = true;

    this.auth.iniciarSesion(this.correo.trim(), this.contrasena).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/']);
      },
      error: (e) => {
        this.cargando = false;
        this.error = e?.status === 401
          ? 'Correo o contraseña incorrectos'
          : mensajeDeError(e);
      }
    });
  }
}
