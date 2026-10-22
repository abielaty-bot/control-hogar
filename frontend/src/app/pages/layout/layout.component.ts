import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth.service';

// Estructura principal estilo panel premium (inspirado en TrendyAdmin):
// barra lateral ciruela con degradado en el item activo, cabecera
// flotante y diseño adaptable (PC / tablet / celular).
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="fondo-menu" *ngIf="menuAbierto" (click)="menuAbierto = false"></div>

    <aside class="lateral" [class.abierto]="menuAbierto">
      <div class="marca">
        <div class="marca-icono"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-5h5v5"/></svg></div>
        <div class="marca-texto">Control <span>Hogar</span></div>
      </div>

      <div class="seccion">Menú</div>

      <nav class="menu">
        <a routerLink="/inicio" routerLinkActive="activo" (click)="menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
          <span>Inicio</span>
        </a>
        <a routerLink="/movimientos" routerLinkActive="activo" (click)="menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h13"/><path d="M13 3l4 4-4 4"/><path d="M20 17H7"/><path d="M11 13l-4 4 4 4"/></svg>
          <span>Movimientos</span>
        </a>
        <a routerLink="/categorias" routerLinkActive="activo" (click)="menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41L10.59 3.41A2 2 0 0 0 9.17 3H4a1 1 0 0 0-1 1v5.17c0 .53.21 1.04.59 1.42l10 10a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>
          <span>Categorías</span>
        </a>
        <a routerLink="/cuentas" routerLinkActive="activo" (click)="menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
          <span>Cuentas</span>
        </a>
        <a routerLink="/presupuestos" routerLinkActive="activo" (click)="menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          <span>Presupuestos</span>
        </a>
        <a routerLink="/deudas" routerLinkActive="activo" (click)="menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>
          <span>Deudas</span>
        </a>
        <a routerLink="/reportes" routerLinkActive="activo" (click)="menuAbierto = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          <span>Reportes</span>
        </a>
      </nav>

      <div class="usuario-tarjeta">
        <div class="avatar">{{ iniciales }}</div>
        <div class="usuario-datos">
          <div class="usuario-nombre">{{ auth.nombreCompleto() }}</div>
          <div class="usuario-rol">Mi hogar</div>
        </div>
        <button class="salir" (click)="salir()" title="Salir" aria-label="Salir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        </button>
      </div>
    </aside>

    <div class="principal">
      <header class="cabecera">
        <button class="hamburguesa" (click)="menuAbierto = !menuAbierto" aria-label="Menú">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>
        </button>
        <div class="cabecera-marca"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-5h5v5"/></svg> Control Hogar</div>
        <div class="cabecera-espacio"></div>
        <a class="boton-nuevo" routerLink="/movimientos">+ Registrar movimiento</a>
        <div class="avatar chico" title="{{ auth.nombreCompleto() }}">{{ iniciales }}</div>
      </header>

      <main class="contenedor">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* ===== Barra lateral ===== */
    .lateral {
      position: fixed;
      inset: 0 auto 0 0;
      width: 252px;
      background: linear-gradient(180deg, #1c0d38, #140826);
      border-right: 1px solid var(--borde);
      padding: 20px 14px 16px;
      display: flex;
      flex-direction: column;
      z-index: 60;
      transition: transform 0.28s ease, width 0.28s ease;
    }

    .marca {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 2px 8px 18px;
    }

    .marca-icono svg { width: 22px; height: 22px; }
    .marca-icono {
      width: 42px;
      height: 42px;
      border-radius: 13px;
      background: var(--degradado);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 21px;
      box-shadow: 0 8px 18px rgba(168, 85, 247, 0.45);
      flex: none;
    }

    .marca-texto {
      font-size: 18.5px;
      font-weight: 700;
      white-space: nowrap;
    }

    .marca-texto span {
      background: var(--degradado);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .seccion {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--texto-tenue);
      padding: 4px 10px 8px;
      white-space: nowrap;
    }

    .menu {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .menu a {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--texto-suave);
      text-decoration: none;
      padding: 11px 12px;
      border-radius: 13px;
      font-size: 14.5px;
      font-weight: 500;
      white-space: nowrap;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .menu a svg {
      width: 20px;
      height: 20px;
      flex: none;
    }

    .menu a:hover {
      background: rgba(168, 85, 247, 0.12);
      color: var(--texto);
    }

    .menu a.activo {
      background: var(--degradado);
      color: #ffffff;
      box-shadow: 0 10px 22px rgba(184, 50, 224, 0.35);
    }

    .usuario-tarjeta {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(168, 85, 247, 0.08);
      border: 1px solid var(--borde);
      border-radius: 16px;
      padding: 10px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--degradado);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: #fff;
      flex: none;
    }

    .avatar.chico {
      width: 38px;
      height: 38px;
      display: none;
    }

    .usuario-datos {
      flex: 1;
      min-width: 0;
    }

    .usuario-nombre {
      font-size: 13.5px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .usuario-rol {
      font-size: 11.5px;
      color: var(--texto-tenue);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .salir {
      background: transparent;
      border: 1px solid var(--borde);
      box-shadow: none;
      color: var(--texto-suave);
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 11px;
      flex: none;
    }

    .salir svg {
      width: 18px;
      height: 18px;
    }

    .salir:hover {
      background: rgba(251, 113, 133, 0.15);
      color: #fda4af;
      transform: none;
      box-shadow: none;
    }

    /* ===== Zona principal ===== */
    .principal {
      margin-left: 252px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .principal .contenedor {
      width: 100%;
      flex: 1;
    }

    .cabecera {
      position: sticky;
      top: 14px;
      z-index: 40;
      margin: 14px 22px 0;
      background: rgba(29, 17, 57, 0.82);
      backdrop-filter: blur(14px);
      border: 1px solid var(--borde);
      border-radius: 999px;
      padding: 9px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--sombra);
    }

    .hamburguesa {
      display: none;
      background: var(--tarjeta-2);
      border: 1px solid var(--borde);
      box-shadow: none;
      width: 38px;
      height: 38px;
      padding: 0;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: var(--texto);
    }

    .hamburguesa svg {
      width: 19px;
      height: 19px;
    }

    .cabecera-marca {
      display: none;
      font-weight: 700;
      font-size: 15.5px;
    }

    .cabecera-espacio {
      flex: 1;
    }

    .boton-nuevo {
      background: var(--degradado);
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      font-size: 13.5px;
      padding: 9px 17px;
      border-radius: 999px;
      box-shadow: 0 8px 20px rgba(168, 85, 247, 0.35);
      white-space: nowrap;
    }

    .fondo-menu {
      display: none;
    }

    /* ===== Tablet: barra de solo iconos ===== */
    @media (max-width: 1023px) and (min-width: 641px) {
      .lateral {
        width: 80px;
        padding: 18px 10px 14px;
      }

      .marca {
        justify-content: center;
        padding-bottom: 14px;
      }

      .marca-texto, .seccion, .menu a span, .usuario-datos {
        display: none;
      }

      .menu a {
        justify-content: center;
        padding: 12px 0;
      }

      .usuario-tarjeta {
        flex-direction: column;
        padding: 8px 4px;
      }

      .principal {
        margin-left: 80px;
      }

      .avatar.chico {
        display: flex;
      }
    }

    /* ===== Celular: barra fuera de pantalla ===== */
    @media (max-width: 640px) {
      .lateral {
        transform: translateX(-105%);
        width: 262px;
        box-shadow: var(--sombra);
      }

      .lateral.abierto {
        transform: none;
      }

      .fondo-menu {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(5, 2, 14, 0.6);
        backdrop-filter: blur(2px);
        z-index: 55;
      }

      .principal {
        margin-left: 0;
      }

      .cabecera {
        margin: 10px 12px 0;
        top: 10px;
      }

      .hamburguesa {
        display: flex;
      }

      .cabecera-marca {
        display: block;
      }

      .boton-nuevo {
        display: none;
      }

      .avatar.chico {
        display: flex;
      }
    }
    /* Interactividad (Bloque 10) */
    .menu a { transition: background 0.18s ease, color 0.18s ease, translate 0.18s ease; }
    @media (min-width: 1024px) { .menu a:hover { translate: 3px 0; } }
    .salir { transition: background 0.15s ease, scale 0.15s ease; }
    .salir:active { scale: 0.92; }
    .cabecera-marca svg { width: 20px; height: 20px; vertical-align: -4px; color: #d8b4fe; }
  `]
})
export class LayoutComponent {

  auth = inject(AuthService);
  private router = inject(Router);

  menuAbierto = false;

  get iniciales(): string {
    const u = this.auth.usuarioActual();
    if (!u) {
      return '?';
    }
    const a = (u.nombres || '?').trim().charAt(0);
    const b = (u.apellidoPaterno || '').trim().charAt(0);
    return (a + b).toUpperCase();
  }

  salir(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
