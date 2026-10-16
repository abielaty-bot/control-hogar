import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { TotalPorCategoria } from '../../core/models';
import { formatoMoneda, mensajeDeError } from '../../core/util';

// Reportes: totales por categoria (JSON) y descarga del PDF de Jasper.
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Reportes</h2>

    <div class="error" *ngIf="error">{{ error }}</div>

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
        {{ descargando ? 'Generando...' : 'Descargar PDF de ' + (tipo === 'GASTO' ? 'gastos' : 'ingresos') }}
      </button>
    </div>
  `
})
export class ReportesComponent implements OnInit {

  private api = inject(ApiService);
  private auth = inject(AuthService);

  tipo = 'GASTO';
  totales: TotalPorCategoria[] = [];
  error = '';
  descargando = false;
  formato = formatoMoneda;

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
    this.api.totalesPorCategoria(this.auth.usuarioId(), this.tipo).subscribe({
      next: (t) => (this.totales = t),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  descargarPdf(): void {
    this.error = '';
    this.descargando = true;

    this.api.descargarPdfMovimientos(this.auth.usuarioId(), this.tipo).subscribe({
      next: (blob) => {
        this.descargando = false;
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'reporte-movimientos-por-categoria.pdf';
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => {
        this.descargando = false;
        this.error = mensajeDeError(e);
      }
    });
  }
}
