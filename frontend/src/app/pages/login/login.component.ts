import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { timeout } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { esErrorDeConexion, mensajeDeError } from '../../core/util';

// Espera maxima para el ingreso: si el servidor tarda en
// responder, no se queda girando para siempre (tope: 15 s).
const ESPERA_MAX_MS = 15000;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-fondo">
      <form class="tarjeta login" (ngSubmit)="ingresar()" novalidate>
        <div class="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-5h5v5"/></svg>
        </div>
        <h1>Control <span>Hogar</span></h1>
        <p class="lema">Tus gastos, claros y en orden</p>

        <div class="error" *ngIf="error">
          {{ error }}
          <button type="button" class="reintentar" *ngIf="errorConexion"
                  (click)="ingresar()">Reintentar</button>
        </div>
        <div class="ok" *ngIf="mensajeOk">{{ mensajeOk }}</div>

        <div class="error bloqueo" *ngIf="segundosBloqueo > 0">
          Demasiados intentos fallidos. Podrás intentarlo de nuevo en
          <strong>{{ tiempoBloqueo }}</strong>
        </div>

        <label for="correo">Correo</label>
        <input id="correo" type="email" [(ngModel)]="correo" name="correo"
               required maxlength="120" autocomplete="email" spellcheck="false"
               placeholder="tucorreo@ejemplo.com"
               (blur)="correoTocado = true" (focus)="calentar()">
        <p class="campo-error" *ngIf="mostrarErrorCorreo">{{ errorCorreo }}</p>

        <label for="contrasena">Contraseña</label>
        <div class="campo-clave">
          <input id="contrasena" [type]="mostrarClave ? 'text' : 'password'"
                 [(ngModel)]="contrasena" name="contrasena"
                 required maxlength="72" autocomplete="current-password"
                 placeholder="••••••••"
                 (blur)="claveTocada = true"
                 (keydown)="detectarBloqMayus($event)"
                 (keyup)="detectarBloqMayus($event)">
          <button type="button" class="ojo" (click)="mostrarClave = !mostrarClave"
                  [attr.aria-label]="mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  [attr.title]="mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            <svg *ngIf="!mostrarClave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg *ngIf="mostrarClave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/></svg>
          </button>
        </div>
        <p class="campo-error" *ngIf="mostrarErrorClave">{{ errorClave }}</p>
        <p class="aviso-mayus" *ngIf="bloqMayus">⚠ Bloq Mayús está activado</p>

        <p class="olvido"><a routerLink="/recuperar">¿Olvidaste tu contraseña?</a></p>

        <button type="submit" class="boton-auth" [disabled]="cargando || segundosBloqueo > 0" style="width:100%">
          {{ textoBoton }}
        </button>

        <p class="nota">
          ¿Aún no tienes cuenta? <a routerLink="/registro">Crear cuenta</a>
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
      border: 1px solid rgba(196, 164, 255, 0.38);
      translate: 0 -3vh;
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
    .login h1 {
      text-align: center;
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .login h1 span {
      background: var(--degradado);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .lema {
      text-align: center;
      color: var(--texto-suave);
      margin: 0 0 22px;
      font-size: 13.5px;
    }
    .login label {
      color: #efe9fb;
      font-weight: 600;
    }
    .login input {
      font-size: 16px;
      border-color: rgba(196, 164, 255, 0.4);
    }
    .login input::placeholder { color: #a394cf; }
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
    .olvido {
      text-align: right;
      font-size: 13px;
      margin: 2px 0 14px;
    }
    .boton-auth {
      background: linear-gradient(120deg, #7c3aed 0%, #a21caf 60%, #be185d 130%);
      margin-top: 2px;
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
    .bloqueo strong {
      font-variant-numeric: tabular-nums;
      font-size: 15px;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {

  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  correo = '';
  contrasena = '';
  error = '';
  mensajeOk = '';
  cargando = false;
  errorConexion = false;

  segundosBloqueo = 0;
  private intervaloBloqueo: ReturnType<typeof setInterval> | null = null;
  mostrarClave = false;
  bloqMayus = false;
  correoTocado = false;
  claveTocada = false;
  enviado = false;
  esperando = false;
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private ultimoCalentamiento = 0;

  constructor() {
    // Mensaje de exito al volver desde la pantalla de registro.
    if (this.route.snapshot.queryParamMap.get('registrado') === '1') {
      this.mensajeOk = '✅ Cuenta creada. Ingresa con tu correo y contraseña.';
    }
  }

  ngOnInit(): void {
    // Ping de calentamiento: despierta el servidor (y la base)
    // mientras el usuario escribe sus datos.
    this.calentar();
  }

  calentar(): void {
    const ahora = Date.now();
    if (ahora - this.ultimoCalentamiento < 60000) {
      return;
    }
    this.ultimoCalentamiento = ahora;
    this.api.salud().subscribe({ error: () => undefined });
  }

  detectarBloqMayus(evento: KeyboardEvent): void {
    this.bloqMayus = !!evento.getModifierState?.('CapsLock');
  }

  get errorCorreo(): string {
    const c = this.correo.trim();
    if (!c) return 'Escribe tu correo.';
    if (c.length > 120) return 'El correo es demasiado largo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) {
      return 'Escribe un correo válido (ej.: nombre@correo.com).';
    }
    return '';
  }

  get errorClave(): string {
    if (!this.contrasena) return 'Escribe tu contraseña.';
    if (this.contrasena.length > 72) return 'La contraseña es demasiado larga.';
    return '';
  }

  get mostrarErrorCorreo(): boolean {
    return (this.correoTocado || this.enviado) && !!this.errorCorreo;
  }

  get mostrarErrorClave(): boolean {
    return (this.claveTocada || this.enviado) && !!this.errorClave;
  }

  get tiempoBloqueo(): string {
    const m = Math.floor(this.segundosBloqueo / 60);
    const s = this.segundosBloqueo % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  get textoBoton(): string {
    if (this.segundosBloqueo > 0) return `Espera ${this.tiempoBloqueo}`;
    if (!this.cargando) return 'Ingresar';
    return this.esperando
      ? 'Un momento más…'
      : 'Ingresando...';
  }

  ingresar(): void {
    this.enviado = true;
    if (this.errorCorreo || this.errorClave) {
      return;
    }
    this.error = '';
    this.errorConexion = false;
    this.cargando = true;
    this.esperando = false;
    // Carga por etapas: si tarda, se explica que esta esperando.
    this.temporizador = setTimeout(() => (this.esperando = true), 6000);

    this.auth.iniciarSesion(this.correo.trim(), this.contrasena)
      .pipe(timeout(ESPERA_MAX_MS))
      .subscribe({
        next: () => {
          this.detenerCarga();
          this.router.navigate(['/']);
        },
        error: (e) => {
          this.detenerCarga();
          if (e?.status === 429) {
            // Bloqueo temporal: cuenta regresiva con los segundos
            // exactos que informa el servidor.
            const seg = Number(e?.error?.reintentarEnSegundos) || 60;
            this.iniciarBloqueo(seg);
            return;
          }
          this.errorConexion = esErrorDeConexion(e);
          this.error = e?.status === 401
            ? 'Correo o contraseña incorrectos'
            : mensajeDeError(e);
        }
      });
  }

  iniciarBloqueo(segundos: number): void {
    this.detenerBloqueo();
    this.segundosBloqueo = Math.max(1, Math.round(segundos));
    this.intervaloBloqueo = setInterval(() => {
      this.segundosBloqueo--;
      if (this.segundosBloqueo <= 0) {
        this.detenerBloqueo();
      }
    }, 1000);
  }

  private detenerBloqueo(): void {
    if (this.intervaloBloqueo) {
      clearInterval(this.intervaloBloqueo);
      this.intervaloBloqueo = null;
    }
    this.segundosBloqueo = 0;
  }

  ngOnDestroy(): void {
    this.detenerBloqueo();
    if (this.temporizador) {
      clearTimeout(this.temporizador);
    }
  }

  private detenerCarga(): void {
    this.cargando = false;
    this.esperando = false;
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }
}
