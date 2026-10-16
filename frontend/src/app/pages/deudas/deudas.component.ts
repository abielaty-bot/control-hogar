import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cuenta, Deuda, PagoDeuda } from '../../core/models';
import { fechaHoy, formatoMoneda, mensajeDeError } from '../../core/util';

@Component({
  selector: 'app-deudas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Deudas</h2>

    <div class="error" *ngIf="error">{{ error }}</div>
    <div class="ok" *ngIf="mensaje">{{ mensaje }}</div>

    <div class="tarjeta">
      <h3>Nueva deuda</h3>
      <form (ngSubmit)="crear()">
        <div class="fila-form">
          <div>
            <label>Nombre</label>
            <input type="text" [(ngModel)]="nueva.nombre" name="nombre"
                   required placeholder="Ej.: Préstamo bancario">
          </div>
          <div>
            <label>Monto total (S/)</label>
            <input type="number" step="0.01" min="0.01" [(ngModel)]="nueva.montoTotal"
                   name="montoTotal" required>
          </div>
          <div>
            <label>Fecha de vencimiento</label>
            <input type="date" [(ngModel)]="nueva.fechaVencimiento" name="fechaVencimiento">
          </div>
        </div>
        <label>Descripción</label>
        <input type="text" [(ngModel)]="nueva.descripcion" name="descripcion"
               placeholder="Opcional">
        <button type="submit">Guardar deuda</button>
      </form>
    </div>

    <div class="tarjeta">
      <table *ngIf="deudas.length; else vacio">
        <tr>
          <th>Nombre</th><th class="numero">Monto</th><th class="numero">Saldo pendiente</th>
          <th>Vence</th><th>Estado</th><th></th><th></th>
        </tr>
        <tr *ngFor="let d of deudas">
          <td>{{ d.nombre }}</td>
          <td class="numero">{{ formato(d.montoTotal) }}</td>
          <td class="numero">{{ formato(d.saldoPendiente) }}</td>
          <td>{{ d.fechaVencimiento || '—' }}</td>
          <td><span class="etiqueta {{ d.estado }}">{{ d.estado }}</span></td>
          <td><button class="secundario" (click)="verPagos(d)">Pagos</button></td>
          <td><button class="peligro" (click)="eliminar(d.id)">Eliminar</button></td>
        </tr>
      </table>
      <ng-template #vacio><p>No tienes deudas registradas. 🎉</p></ng-template>
    </div>

    <div class="tarjeta" *ngIf="seleccionada">
      <h3>Pagos de «{{ seleccionada.nombre }}» — saldo: {{ formato(seleccionada.saldoPendiente) }}</h3>

      <form (ngSubmit)="registrarPago()">
        <div class="fila-form">
          <div>
            <label>Cuenta</label>
            <select [(ngModel)]="pago.cuentaId" name="cuentaId" required>
              <option *ngFor="let c of cuentas" [ngValue]="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div>
            <label>Monto (S/)</label>
            <input type="number" step="0.01" min="0.01" [(ngModel)]="pago.monto"
                   name="monto" required>
          </div>
          <div>
            <label>Fecha de pago</label>
            <input type="date" [(ngModel)]="pago.fechaPago" name="fechaPago" required>
          </div>
        </div>
        <button type="submit">Registrar pago</button>
      </form>

      <table *ngIf="pagos.length" style="margin-top:14px">
        <tr><th>Fecha</th><th>Cuenta</th><th class="numero">Monto</th><th></th></tr>
        <tr *ngFor="let p of pagos">
          <td>{{ p.fechaPago }}</td>
          <td>{{ p.cuenta?.nombre || '—' }}</td>
          <td class="numero">{{ formato(p.monto) }}</td>
          <td><button class="peligro" (click)="eliminarPago(p.id)">Anular</button></td>
        </tr>
      </table>
      <p *ngIf="!pagos.length">Esta deuda aún no tiene pagos.</p>
    </div>
  `
})
export class DeudasComponent implements OnInit {

  private api = inject(ApiService);
  private auth = inject(AuthService);

  deudas: Deuda[] = [];
  cuentas: Cuenta[] = [];
  seleccionada: Deuda | null = null;
  pagos: PagoDeuda[] = [];
  error = '';
  mensaje = '';
  formato = formatoMoneda;

  nueva: any = { nombre: '', descripcion: '', montoTotal: null, fechaVencimiento: '' };
  pago: any = { cuentaId: null, monto: null, fechaPago: fechaHoy() };

  ngOnInit(): void {
    this.cargar();
    this.api.listarCuentas(this.auth.usuarioId()).subscribe({
      next: (p) => (this.cuentas = p.content)
    });
  }

  cargar(): void {
    this.api.listarDeudas(this.auth.usuarioId()).subscribe({
      next: (p) => (this.deudas = p.content),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  crear(): void {
    this.error = '';
    this.mensaje = '';

    const cuerpo: any = {
      nombre: this.nueva.nombre,
      descripcion: this.nueva.descripcion || null,
      montoTotal: this.nueva.montoTotal,
      fechaInicio: fechaHoy(),
      fechaVencimiento: this.nueva.fechaVencimiento || null,
      usuario: { id: this.auth.usuarioId() }
    };

    this.api.crearDeuda(cuerpo).subscribe({
      next: () => {
        this.mensaje = 'Deuda registrada';
        this.nueva = { nombre: '', descripcion: '', montoTotal: null, fechaVencimiento: '' };
        this.cargar();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  eliminar(id: number): void {
    this.error = '';
    this.mensaje = '';

    this.api.eliminarDeuda(id).subscribe({
      next: () => {
        this.mensaje = 'Deuda eliminada';
        if (this.seleccionada?.id === id) {
          this.seleccionada = null;
          this.pagos = [];
        }
        this.cargar();
      },
      // Si la deuda tiene pagos, la API responde 409 y se muestra el motivo
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  verPagos(deuda: Deuda): void {
    this.seleccionada = deuda;
    this.cargarPagos();
  }

  cargarPagos(): void {
    if (!this.seleccionada) {
      return;
    }
    this.api.listarPagos(this.seleccionada.id).subscribe({
      next: (p) => (this.pagos = p),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  registrarPago(): void {
    if (!this.seleccionada) {
      return;
    }
    this.error = '';
    this.mensaje = '';

    const cuerpo = {
      monto: this.pago.monto,
      fechaPago: this.pago.fechaPago,
      cuenta: { id: this.pago.cuentaId }
    };

    this.api.registrarPago(this.seleccionada.id, cuerpo).subscribe({
      next: () => {
        this.mensaje = 'Pago registrado: el saldo de la deuda se actualizó';
        this.pago.monto = null;
        this.cargar();
        this.cargarPagos();
        // Refrescar el saldo mostrado de la deuda seleccionada
        this.api.listarDeudas(this.auth.usuarioId()).subscribe({
          next: (p) => {
            const actual = p.content.find((d) => d.id === this.seleccionada?.id);
            if (actual) {
              this.seleccionada = actual;
            }
          }
        });
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  eliminarPago(pagoId: number): void {
    this.error = '';
    this.mensaje = '';

    this.api.eliminarPago(pagoId).subscribe({
      next: () => {
        this.mensaje = 'Pago anulado: el monto volvió al saldo';
        this.cargar();
        this.cargarPagos();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }
}
