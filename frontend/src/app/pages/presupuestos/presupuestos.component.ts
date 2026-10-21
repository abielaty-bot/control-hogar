import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Categoria, PresupuestoCategoria, PresupuestoMensual } from '../../core/models';
import { formatoMoneda, mensajeDeError } from '../../core/util';

@Component({
  selector: 'app-presupuestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Presupuestos</h2>

    <div class="error" *ngIf="error">{{ error }}</div>
    <div class="ok" *ngIf="mensaje">{{ mensaje }}</div>

    <div class="tarjeta">
      <h3>Nuevo presupuesto mensual</h3>
      <form (ngSubmit)="crear()">
        <div class="fila-form">
          <div>
            <label>Año</label>
            <input type="number" [(ngModel)]="nuevo.anio" name="anio" required>
          </div>
          <div>
            <label>Mes</label>
            <select [(ngModel)]="nuevo.mes" name="mes">
              <option *ngFor="let m of meses" [ngValue]="m.valor">{{ m.nombre }}</option>
            </select>
          </div>
          <div>
            <label>Monto total (S/)</label>
            <input type="number" step="0.01" min="0.01" [(ngModel)]="nuevo.montoTotal"
                   name="montoTotal" required>
          </div>
        </div>
        <button type="submit">Guardar presupuesto</button>
      </form>
    </div>

    <div class="tarjeta">
      <table *ngIf="presupuestos.length; else vacio">
        <tr><th>Periodo</th><th class="numero">Monto total</th><th></th><th></th></tr>
        <tr *ngFor="let p of presupuestos">
          <td>{{ nombreMes(p.mes) }} {{ p.anio }}</td>
          <td class="numero">{{ formato(p.montoTotal) }}</td>
          <td><button class="secundario" (click)="verDetalle(p)">Detalle</button></td>
          <td><button class="peligro" (click)="eliminar(p.id)">Eliminar</button></td>
        </tr>
      </table>
      <ng-template #vacio><p>Aún no tienes presupuestos.</p></ng-template>
    </div>

    <div class="tarjeta" *ngIf="seleccionado">
      <h3>Detalle de {{ nombreMes(seleccionado.mes) }} {{ seleccionado.anio }}</h3>

      <form (ngSubmit)="agregarDetalle()">
        <div class="fila-form">
          <div>
            <label>Categoría</label>
            <select [(ngModel)]="detalle.categoriaId" name="categoriaId" required>
              <option *ngFor="let c of categorias" [ngValue]="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div>
            <label>Monto asignado (S/)</label>
            <input type="number" step="0.01" min="0.01" [(ngModel)]="detalle.montoAsignado"
                   name="montoAsignado" required>
          </div>
        </div>
        <button type="submit">Agregar al detalle</button>
      </form>

      <table *ngIf="detalles.length" style="margin-top:14px">
        <tr><th>Categoría</th><th class="numero">Monto asignado</th><th></th></tr>
        <tr *ngFor="let d of detalles">
          <td>{{ d.categoria.nombre }}</td>
          <td class="numero">{{ formato(d.montoAsignado) }}</td>
          <td><button class="peligro" (click)="eliminarDetalle(d.id)">Quitar</button></td>
        </tr>
      </table>
      <p *ngIf="!detalles.length">Este presupuesto aún no tiene montos por categoría.</p>
    </div>
  `
})
export class PresupuestosComponent implements OnInit {

  private api = inject(ApiService);
  private auth = inject(AuthService);

  presupuestos: PresupuestoMensual[] = [];
  categorias: Categoria[] = [];
  seleccionado: PresupuestoMensual | null = null;
  detalles: PresupuestoCategoria[] = [];
  error = '';
  mensaje = '';
  formato = formatoMoneda;

  meses = [
    { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' }, { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' }, { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' }
  ];

  nuevo: any = {
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    montoTotal: null
  };

  detalle: any = { categoriaId: null, montoAsignado: null };

  ngOnInit(): void {
    this.cargar();
    this.api.listarCategorias(this.auth.usuarioId()).subscribe({
      next: (p) => (this.categorias = p.content)
    });
  }

  nombreMes(mes: number): string {
    return this.meses.find((m) => m.valor === mes)?.nombre ?? String(mes);
  }

  cargar(): void {
    this.api.listarPresupuestos(this.auth.usuarioId()).subscribe({
      next: (p) => (this.presupuestos = p.content),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  crear(): void {
    this.error = '';
    this.mensaje = '';

    const cuerpo = {
      anio: this.nuevo.anio,
      mes: this.nuevo.mes,
      montoTotal: this.nuevo.montoTotal,
      usuario: { id: this.auth.usuarioId() }
    };

    this.api.crearPresupuesto(cuerpo).subscribe({
      next: () => {
        this.mensaje = 'Presupuesto creado';
        this.nuevo.montoTotal = null;
        this.cargar();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  eliminar(id: number): void {
    this.error = '';
    this.mensaje = '';

    this.api.eliminarPresupuesto(id).subscribe({
      next: () => {
        this.mensaje = 'Presupuesto eliminado';
        if (this.seleccionado?.id === id) {
          this.seleccionado = null;
          this.detalles = [];
        }
        this.cargar();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  verDetalle(presupuesto: PresupuestoMensual): void {
    this.seleccionado = presupuesto;
    this.cargarDetalle();
  }

  cargarDetalle(): void {
    if (!this.seleccionado) {
      return;
    }
    this.api.listarDetallePresupuesto(this.seleccionado.id).subscribe({
      next: (d) => (this.detalles = d),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  agregarDetalle(): void {
    if (!this.seleccionado) {
      return;
    }
    this.error = '';
    this.mensaje = '';

    const cuerpo = {
      categoria: { id: this.detalle.categoriaId },
      montoAsignado: this.detalle.montoAsignado
    };

    this.api.agregarDetallePresupuesto(this.seleccionado.id, cuerpo).subscribe({
      next: () => {
        this.mensaje = 'Monto asignado a la categoría';
        this.detalle = { categoriaId: null, montoAsignado: null };
        this.cargarDetalle();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  eliminarDetalle(detalleId: number): void {
    this.error = '';
    this.mensaje = '';

    this.api.eliminarDetallePresupuesto(detalleId).subscribe({
      next: () => {
        this.mensaje = 'Detalle eliminado';
        this.cargarDetalle();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }
}
