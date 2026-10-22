import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { timeout } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { esErrorDeConexion, mensajeDeError } from '../../core/util';

// Espera maxima para el ingreso: si el servidor gratuito esta
// dormido, no se queda girando para siempre (arreglo del 2026-10-21).
const ESPERA_MAX_MS = 25000;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-fondo">
      <form class="tarjeta login" (ngSubmit)="ingresar()">
        <div class="logo">🏠</div>
        <h1>Control <span>Hogar</span></h1>
        <p class="sub">Ingresa con tu correo y contraseña</p>

        <div class="error" *ngIf="error">
          {{ error }}
          <button type="button" class="reintentar" *ngIf="errorConexion"
                  (click)="ingresar()">Reintentar</button>
        </div>
        <div class="ok" *ngIf="mensajeOk">{{ mensajeOk }}</div>

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
          ¿Aún no tienes cuenta? <a routerLink="/registro">Regístrate aquí</a>
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
      padding: 22px 14px;
      background:
        radial-gradient(800px 420px at 85% -10%, rgba(124, 58, 237, 0.35), transparent 60%),
        radial-gradient(700px 420px at -10% 110%, rgba(233, 53, 193, 0.18), transparent 55%),
        var(--fondo);
    }
    .login {
      width: 380px;
      max-width: 94vw;
      padding: 30px 28px 24px;
    }
    .logo {
      width: 58px;
      height: 58px;
      margin: 0 auto 12px;
      border-radius: 17px;
      background: var(--degradado);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      box-shadow: 0 12px 26px rgba(168, 85, 247, 0.45);
    }
    .login h1 {
      text-align: center;
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .login h1 span {
      background: var(--degradado);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .sub {
      text-align: center;
      color: var(--texto-suave);
      margin: 0 0 20px;
      font-size: 14px;
    }
    .nota {
      font-size: 13px;
      color: var(--texto-suave);
      margin: 16px 0 0;
      text-align: center;
    }
    .reintentar {
      display: block;
      margin-top: 10px;
      padding: 7px 16px;
      font-size: 13px;
    }
  `]
})
export class LoginComponent {

  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  correo = '';
  contrasena = '';
  error = '';
  mensajeOk = '';
  cargando = false;
  errorConexion = false;

  constructor() {
    // Mensaje de exito al volver desde la pantalla de registro.
    if (this.route.snapshot.queryParamMap.get('registrado') === '1') {
      this.mensajeOk = '✅ Cuenta creada. Ingresa con tu correo y contraseña.';
    }
  }

  ingresar(): void {
    this.error = '';
    this.errorConexion = false;
    this.cargando = true;

    this.auth.iniciarSesion(this.correo.trim(), this.contrasena)
      .pipe(timeout(ESPERA_MAX_MS))
      .subscribe({
        next: () => {
          this.cargando = false;
          this.router.navigate(['/']);
        },
        error: (e) => {
          this.cargando = false;
          this.errorConexion = esErrorDeConexion(e);
          this.error = e?.status === 401
            ? 'Correo o contraseña incorrectos'
            : mensajeDeError(e);
        }
      });
  }
}
