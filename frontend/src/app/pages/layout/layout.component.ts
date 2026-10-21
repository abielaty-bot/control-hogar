import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth.service';

// Componente de estructura: barra superior + menu + zona de paginas.
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="barra">
      <div class="marca">🏠 Control Hogar</div>
      <div class="usuario">
        <span>{{ auth.nombreCompleto() }}</span>
        <button class="secundario" (click)="salir()">Salir</button>
      </div>
    </header>

    <nav class="menu">
      <a routerLink="/inicio" routerLinkActive="activo">Inicio</a>
      <a routerLink="/movimientos" routerLinkActive="activo">Movimientos</a>
      <a routerLink="/categorias" routerLinkActive="activo">Categorías</a>
      <a routerLink="/cuentas" routerLinkActive="activo">Cuentas</a>
      <a routerLink="/presupuestos" routerLinkActive="activo">Presupuestos</a>
      <a routerLink="/deudas" routerLinkActive="activo">Deudas</a>
      <a routerLink="/reportes" routerLinkActive="activo">Reportes</a>
    </nav>

    <main class="contenedor">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .barra {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1f3864;
      color: #ffffff;
      padding: 10px 20px;
    }
    .marca {
      font-size: 18px;
      font-weight: 700;
    }
    .usuario {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .menu {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      padding: 8px 16px;
    }
    .menu a {
      color: #1f2937;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
    }
    .menu a:hover {
      background: #eef2ff;
    }
    .menu a.activo {
      background: #4472c4;
      color: #ffffff;
    }
  `]
})
export class LayoutComponent {

  auth = inject(AuthService);
  private router = inject(Router);

  salir(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
