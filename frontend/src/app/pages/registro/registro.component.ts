import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { timeout } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { mensajeDeError } from '../../core/util';

// Registro publico de usuarios: consume POST /api/usuarios (permitido sin login).
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-fondo">
      <form class="tarjeta registro" (ngSubmit)="registrar()">
        <h1>🏠 Control Hogar</h1>
        <p class="sub">Crea tu cuenta</p>

        <div class="error" *ngIf="error">{{ error }}</div>

        <label for="nombres">Nombres *</label>
        <input id="nombres" [(ngModel)]="nombres" name="nombres"
               required placeholder="Ej.: Abiel Aurelio">

        <label for="apellidoPaterno">Apellido paterno *</label>
        <input id="apellidoPaterno" [(ngModel)]="apellidoPaterno"
               name="apellidoPaterno" required placeholder="Ej.: Tineo">

        <label for="apellidoMaterno">Apellido materno</label>
        <input id="apellidoMaterno" [(ngModel)]="apellidoMaterno"
               name="apellidoMaterno" placeholder="Ej.: Yupanqui">

        <label for="correo">Correo *</label>
        <input id="correo" type="email" [(ngModel)]="correo" name="correo"
               required placeholder="tucorreo@ejemplo.com">

        <label for="telefono">Teléfono</label>
        <input id="telefono" [(ngModel)]="telefono" name="telefono"
               placeholder="987654321">

        <label for="contrasena">Contraseña *</label>
        <input id="contrasena" type="password" [(ngModel)]="contrasena"
               name="contrasena" required placeholder="••••••••">

        <label for="confirmar">Confirmar contraseña *</label>
        <input id="confirmar" type="password" [(ngModel)]="confirmar"
               name="confirmar" required placeholder="••••••••">

        <button type="submit" [disabled]="cargando" style="width:100%">
          {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>

        <p class="nota">
          ¿Ya tienes cuenta? <a routerLink="/login">Ingresa aquí</a>
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
      padding: 26px 14px;
      background:
        radial-gradient(800px 420px at 85% -10%, rgba(124, 58, 237, 0.35), transparent 60%),
        radial-gradient(700px 420px at -10% 110%, rgba(233, 53, 193, 0.18), transparent 55%),
        var(--fondo);
    }
    .registro {
      width: 400px;
      max-width: 94vw;
      padding: 28px 28px 22px;
    }
    .registro h1 {
      text-align: center;
      font-size: 25px;
      font-weight: 800;
    }
    .sub {
      text-align: center;
      color: var(--texto-suave);
      margin: 0 0 18px;
      font-size: 14px;
    }
    .nota {
      font-size: 13px;
      color: var(--texto-suave);
      margin: 16px 0 0;
      text-align: center;
    }
  `]
})
export class RegistroComponent {

  private api = inject(ApiService);
  private router = inject(Router);

  nombres = '';
  apellidoPaterno = '';
  apellidoMaterno = '';
  correo = '';
  telefono = '';
  contrasena = '';
  confirmar = '';
  error = '';
  cargando = false;

  registrar(): void {
    this.error = '';

    if (this.contrasena !== this.confirmar) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    const cuerpo: Record<string, string> = {
      nombres: this.nombres.trim(),
      apellidoPaterno: this.apellidoPaterno.trim(),
      correo: this.correo.trim(),
      passwordHash: this.contrasena
    };
    if (this.apellidoMaterno.trim()) {
      cuerpo['apellidoMaterno'] = this.apellidoMaterno.trim();
    }
    if (this.telefono.trim()) {
      cuerpo['telefono'] = this.telefono.trim();
    }

    this.cargando = true;
    this.api.registrarUsuario(cuerpo).pipe(timeout(25000)).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/login'], { queryParams: { registrado: '1' } });
      },
      error: (e) => {
        this.cargando = false;
        this.error = mensajeDeError(e);
      }
    });
  }
}
