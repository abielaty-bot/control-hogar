import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { timeout } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { esErrorDeConexion, mensajeDeError } from '../../core/util';

// Registro publico de usuarios: consume POST /api/usuarios (permitido sin login).
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-fondo">
      <form class="tarjeta registro" (ngSubmit)="registrar()" novalidate>
        <div class="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-5h5v5"/></svg>
        </div>
        <h1>Control <span>Hogar</span></h1>
        <p class="sub">Crea tu cuenta</p>

        <div class="error" *ngIf="error">
          {{ error }}
          <button type="button" class="reintentar" *ngIf="errorConexion"
                  (click)="registrar()">Reintentar</button>
        </div>

        <label for="nombres">Nombres *</label>
        <input id="nombres" [(ngModel)]="nombres" name="nombres"
               required maxlength="80" autocomplete="given-name"
               placeholder="Ej.: Abiel Aurelio" (blur)="tocado.nombres = true">
        <p class="campo-error" *ngIf="mostrar('nombres')">Escribe tus nombres.</p>

        <label for="apellidoPaterno">Apellido paterno *</label>
        <input id="apellidoPaterno" [(ngModel)]="apellidoPaterno"
               name="apellidoPaterno" required maxlength="60"
               autocomplete="family-name" placeholder="Ej.: Tineo"
               (blur)="tocado.apellidoPaterno = true">
        <p class="campo-error" *ngIf="mostrar('apellidoPaterno')">Escribe tu apellido paterno.</p>

        <label for="apellidoMaterno">Apellido materno</label>
        <input id="apellidoMaterno" [(ngModel)]="apellidoMaterno"
               name="apellidoMaterno" maxlength="60"
               autocomplete="additional-name" placeholder="Ej.: Yupanqui">

        <label for="correo">Correo *</label>
        <input id="correo" type="email" [(ngModel)]="correo" name="correo"
               required maxlength="120" autocomplete="email" spellcheck="false"
               placeholder="tucorreo@ejemplo.com" (blur)="tocado.correo = true">
        <p class="campo-error" *ngIf="mostrar('correo')">{{ errorCorreo }}</p>

        <label for="telefono">Teléfono</label>
        <input id="telefono" [(ngModel)]="telefono" name="telefono"
               maxlength="20" autocomplete="tel" placeholder="987654321">

        <label for="contrasena">Contraseña *</label>
        <div class="campo-clave">
          <input id="contrasena" [type]="mostrarClave ? 'text' : 'password'"
                 [(ngModel)]="contrasena" name="contrasena"
                 required maxlength="72" autocomplete="new-password"
                 placeholder="••••••••" (blur)="tocado.contrasena = true"
                 (keydown)="detectarBloqMayus($event)"
                 (keyup)="detectarBloqMayus($event)">
          <button type="button" class="ojo" (click)="mostrarClave = !mostrarClave"
                  [attr.aria-label]="mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            <svg *ngIf="!mostrarClave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg *ngIf="mostrarClave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/></svg>
          </button>
        </div>
        <p class="campo-error" *ngIf="mostrar('contrasena')">Escribe una contraseña (máximo 72 caracteres).</p>
        <p class="aviso-mayus" *ngIf="bloqMayus">⚠ Bloq Mayús está activado</p>

        <label for="confirmar">Confirmar contraseña *</label>
        <div class="campo-clave">
          <input id="confirmar" [type]="mostrarConfirmar ? 'text' : 'password'"
                 [(ngModel)]="confirmar" name="confirmar"
                 required maxlength="72" autocomplete="new-password"
                 placeholder="••••••••" (blur)="tocado.confirmar = true">
          <button type="button" class="ojo" (click)="mostrarConfirmar = !mostrarConfirmar"
                  [attr.aria-label]="mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            <svg *ngIf="!mostrarConfirmar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg *ngIf="mostrarConfirmar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/></svg>
          </button>
        </div>
        <p class="campo-error" *ngIf="mostrar('confirmar')">Las contraseñas no coinciden.</p>

        <button type="submit" class="boton-auth" [disabled]="cargando" style="width:100%">
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
      border: 1px solid rgba(196, 164, 255, 0.38);
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
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
    }
    .logo svg { width: 30px; height: 30px; }
    .registro h1 {
      text-align: center;
      font-size: 25px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .registro h1 span {
      background: var(--degradado);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .sub {
      text-align: center;
      color: var(--texto-suave);
      margin: 0 0 18px;
      font-size: 14px;
    }
    .registro label {
      color: #efe9fb;
      font-weight: 600;
    }
    .registro input {
      font-size: 16px;
      border-color: rgba(196, 164, 255, 0.4);
    }
    .registro input::placeholder { color: #a394cf; }
    .campo-error {
      color: #fda4af;
      font-size: 12.5px;
      margin: -6px 0 10px;
    }
    .aviso-mayus {
      color: #fcd34d;
      font-size: 12.5px;
      margin: -6px 0 10px;
    }
    .campo-clave { position: relative; }
    .campo-clave input { width: 100%; padding-right: 44px; }
    .ojo {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-58%);
      width: 34px;
      height: 34px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 9px;
      color: var(--texto-suave);
      cursor: pointer;
      box-shadow: none;
    }
    .ojo:hover { color: var(--texto); background: rgba(168, 85, 247, 0.14); }
    .ojo svg { width: 19px; height: 19px; }
    .boton-auth {
      background: linear-gradient(120deg, #7c3aed 0%, #a21caf 60%, #be185d 130%);
      margin-top: 8px;
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
  errorConexion = false;

  mostrarClave = false;
  mostrarConfirmar = false;
  bloqMayus = false;
  enviado = false;
  tocado: Record<string, boolean> = {};

  detectarBloqMayus(evento: KeyboardEvent): void {
    this.bloqMayus = !!evento.getModifierState?.('CapsLock');
  }

  get errorCorreo(): string {
    const c = this.correo.trim();
    if (!c) return 'Escribe tu correo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) {
      return 'Escribe un correo válido (ej.: nombre@correo.com).';
    }
    return '';
  }

  mostrar(campo: string): boolean {
    if (!this.enviado && !this.tocado[campo]) {
      return false;
    }
    switch (campo) {
      case 'nombres': return !this.nombres.trim();
      case 'apellidoPaterno': return !this.apellidoPaterno.trim();
      case 'correo': return !!this.errorCorreo;
      case 'contrasena': return !this.contrasena || this.contrasena.length > 72;
      case 'confirmar': return this.contrasena !== this.confirmar;
      default: return false;
    }
  }

  registrar(): void {
    this.error = '';
    this.errorConexion = false;
    this.enviado = true;

    if (!this.nombres.trim() || !this.apellidoPaterno.trim()
        || this.errorCorreo || !this.contrasena
        || this.contrasena !== this.confirmar) {
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
    this.api.registrarUsuario(cuerpo).pipe(timeout(15000)).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/login'], { queryParams: { registrado: '1' } });
      },
      error: (e) => {
        this.cargando = false;
        this.errorConexion = esErrorDeConexion(e);
        this.error = mensajeDeError(e);
      }
    });
  }
}
