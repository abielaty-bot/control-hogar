import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { TotalPorCategoria } from '../../core/models';
import { esErrorDeConexion, formatoMoneda, mensajeDeError } from '../../core/util';

// Reportes: totales por categoria (JSON) y descarga del PDF de Jasper.
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Reportes</h2>

    <div class="error" *ngIf="error">
      {{ error }}
      <button type="button" class="reintentar" *ngIf="errorConexion && errorFuePdf"
              (click)="descargarPdf()">Reintentar</button>
    </div>

    <div class="tarjeta">
      <h3>Totales por categoría</h3>
      <div class="fila-form">
        <div>
          <label>Tipo de movimiento</label>
          <select [(ngModel)]="tipo" name="tipo" (change)="cargar()">
            <option value="GASTO">Gastos</option>
            <option value="INGRESO">Ingresos</option>
          </select>
        </div>
      </div>

      <table *ngIf="totales.length; else vacio">
        <tr><th>Categoría</th><th class="numero">Movimientos</th><th class="numero">Total</th></tr>
        <tr *ngFor="let t of totales">
          <td>{{ t.categoria || 'Sin categoría' }}</td>
          <td class="numero">{{ t.cantidad }}</td>
          <td class="numero">{{ formato(t.total) }}</td>
        </tr>
        <tr>
          <td><strong>TOTAL</strong></td>
          <td class="numero"><strong>{{ cantidadTotal }}</strong></td>
          <td class="numero"><strong>{{ formato(sumaTotal) }}</strong></td>
        </tr>
      </table>
      <ng-template #vacio><p>Sin datos para este tipo.</p></ng-template>
    </div>

    <div class="tarjeta">
      <h3>Reporte PDF (JasperReports)</h3>
      <p>
        Descarga el reporte de movimientos por categoría generado en el
        servidor con la plantilla de Jasper Studio: tabla, totales y
        gráfico circular.
      </p>
      <button (click)="descargarPdf()" [disabled]="descargando">
        <span class="spinner" *ngIf="descargando"></span>{{ descargando ? textoEtapa : 'Descargar PDF de ' + (tipo === 'GASTO' ? 'gastos' : 'ingresos') }}
      </button>
      <div class="progreso" *ngIf="descargando">
        <div class="progreso-barra"></div>
      </div>
      <div class="ok-descarga" *ngIf="descargadoOk">
        ✅ Reporte descargado. Revisa tu carpeta de descargas.
      </div>
    </div>
  `,
  styles: [`
    .progreso {
      height: 6px;
      border-radius: 999px;
      background: rgba(178, 148, 255, 0.14);
      overflow: hidden;
      margin-top: 14px;
      position: relative;
    }
    .progreso-barra {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 40%;
      border-radius: 999px;
      background: var(--degradado);
      animation: barrer 1.15s ease-in-out infinite;
    }
    @keyframes barrer {
      0% { left: -40%; }
      100% { left: 100%; }
    }
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #fff;
      border-radius: 50%;
      vertical-align: -2px;
      margin-right: 8px;
      animation: girar 0.7s linear infinite;
    }
    @keyframes girar {
      to { transform: rotate(360deg); }
    }
    .ok-descarga {
      background: rgba(52, 211, 153, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.35);
      color: #6ee7b7;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13.5px;
      margin-top: 14px;
    }
    .reintentar {
      display: block;
      margin-top: 10px;
      padding: 7px 16px;
      font-size: 13px;
    }
  `]
})
export class ReportesComponent implements OnInit {

  private api = inject(ApiService);
  private auth = inject(AuthService);

  tipo = 'GASTO';
  totales: TotalPorCategoria[] = [];
  error = '';
  descargando = false;
  descargadoOk = false;
  errorConexion = false;
  errorFuePdf = false;
  etapa = 0;
  formato = formatoMoneda;

  private temporizadores: ReturnType<typeof setTimeout>[] = [];

  private readonly ETAPAS = [
    'Generando tu reporte…',
    'Armando el PDF con tus datos…',
    'Ya casi está listo…'
  ];

  get textoEtapa(): string {
    return this.ETAPAS[Math.min(this.etapa, this.ETAPAS.length - 1)];
  }

  get sumaTotal(): number {
    return this.totales.reduce((s, t) => s + Number(t.total), 0);
  }

  get cantidadTotal(): number {
    return this.totales.reduce((s, t) => s + Number(t.cantidad), 0);
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.error = '';
    this.errorConexion = false;
    this.errorFuePdf = false;
    this.descargadoOk = false;
    this.api.totalesPorCategoria(this.auth.usuarioId(), this.tipo).subscribe({
      next: (t) => (this.totales = t),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  descargarPdf(): void {
    this.error = '';
    this.errorConexion = false;
    this.errorFuePdf = false;
    this.descargadoOk = false;
    this.descargando = true;
    this.etapa = 0;
    // Mensajes por etapas mientras el servidor genera el PDF.
    this.temporizadores = [
      setTimeout(() => (this.etapa = 1), 4000),
      setTimeout(() => (this.etapa = 2), 12000)
    ];

    this.api.descargarPdfMovimientos(this.auth.usuarioId(), this.tipo)
      .pipe(timeout(45000))
      .subscribe({
        next: (blob) => {
          this.detenerGeneracion();
          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = 'reporte-movimientos-por-categoria.pdf';
          enlace.click();
          URL.revokeObjectURL(url);
          this.descargadoOk = true;
        },
        error: (e) => {
          this.detenerGeneracion();
          this.errorConexion = esErrorDeConexion(e);
          this.errorFuePdf = true;
          this.error = mensajeDeError(e);
        }
      });
  }

  private detenerGeneracion(): void {
    this.descargando = false;
    this.temporizadores.forEach((t) => clearTimeout(t));
    this.temporizadores = [];
  }
}
