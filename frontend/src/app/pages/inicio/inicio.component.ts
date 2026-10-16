import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Movimiento, TotalPorCategoria } from '../../core/models';
import { formatoMoneda, mensajeDeError } from '../../core/util';

// Pagina de inicio: resumen del mes con los totales de la API.
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Bienvenido, {{ auth.nombreCompleto() }}</h2>

    <div class="error" *ngIf="error">{{ error }}</div>

    <div class="kpis">
      <div class="kpi ingreso">
        <div>Ingresos</div>
        <div class="monto">{{ formato(totalIngresos) }}</div>
      </div>
      <div class="kpi gasto">
        <div>Gastos</div>
        <div class="monto">{{ formato(totalGastos) }}</div>
      </div>
      <div class="kpi">
        <div>Balance</div>
        <div class="monto">{{ formato(totalIngresos - totalGastos) }}</div>
      </div>
    </div>

    <div class="tarjeta">
      <h3>Gastos por categoría</h3>
      <table *ngIf="gastosPorCategoria.length; else sinDatos">
        <tr><th>Categoría</th><th class="numero">Movimientos</th><th class="numero">Total</th></tr>
        <tr *ngFor="let t of gastosPorCategoria">
          <td>{{ t.categoria || 'Sin categoría' }}</td>
          <td class="numero">{{ t.cantidad }}</td>
          <td class="numero">{{ formato(t.total) }}</td>
        </tr>
      </table>
      <ng-template #sinDatos><p>Todavía no registras gastos.</p></ng-template>
    </div>

    <div class="tarjeta">
      <h3>Movimientos recientes</h3>
      <table *ngIf="recientes.length; else sinMovimientos">
        <tr><th>Fecha</th><th>Descripción</th><th>Tipo</th><th class="numero">Monto</th></tr>
        <tr *ngFor="let m of recientes">
          <td>{{ m.fecha }}</td>
          <td>{{ m.descripcion }}</td>
          <td>{{ m.tipo }}</td>
          <td class="numero">{{ formato(m.montoTotal) }}</td>
        </tr>
      </table>
      <ng-template #sinMovimientos><p>Sin movimientos registrados.</p></ng-template>
    </div>
  `
})
export class InicioComponent implements OnInit {

  private api = inject(ApiService);
  auth = inject(AuthService);

  totalGastos = 0;
  totalIngresos = 0;
  gastosPorCategoria: TotalPorCategoria[] = [];
  recientes: Movimiento[] = [];
  error = '';

  formato = formatoMoneda;

  ngOnInit(): void {
    const usuarioId = this.auth.usuarioId();

    this.api.totalesPorCategoria(usuarioId, 'GASTO').subscribe({
      next: (totales) => {
        this.gastosPorCategoria = totales;
        this.totalGastos = totales.reduce((s, t) => s + Number(t.total), 0);
      },
      error: (e) => (this.error = mensajeDeError(e))
    });

    this.api.totalesPorCategoria(usuarioId, 'INGRESO').subscribe({
      next: (totales) => {
        this.totalIngresos = totales.reduce((s, t) => s + Number(t.total), 0);
      },
      error: (e) => (this.error = mensajeDeError(e))
    });

    this.api.listarMovimientos(usuarioId, 0, 5).subscribe({
      next: (pagina) => (this.recientes = pagina.content),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }
}
