import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cuenta } from '../../core/models';
import { formatoMoneda, mensajeDeError } from '../../core/util';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Cuentas</h2>

    <div class="error" *ngIf="error">{{ error }}</div>
    <div class="ok" *ngIf="mensaje">{{ mensaje }}</div>

    <div class="tarjeta">
      <h3>Nueva cuenta</h3>
      <form (ngSubmit)="crear()">
        <div class="fila-form">
          <div>
            <label>Nombre</label>
            <input type="text" [(ngModel)]="nueva.nombre" name="nombre"
                   required placeholder="Ej.: BCP Ahorros">
          </div>
          <div>
            <label>Tipo de cuenta</label>
            <select [(ngModel)]="nueva.tipoCuenta" name="tipoCuenta">
              <option value="BANCO">Banco</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="BILLETERA">Billetera digital</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>
          <div>
            <label>Saldo inicial (S/)</label>
            <input type="number" step="0.01" min="0" [(ngModel)]="nueva.saldoInicial"
                   name="saldoInicial" required>
          </div>
        </div>
        <button type="submit">Guardar cuenta</button>
      </form>
    </div>

    <div class="tarjeta">
      <table *ngIf="cuentas.length; else vacio">
        <tr><th>Nombre</th><th>Tipo</th><th class="numero">Saldo inicial</th><th class="numero">Saldo actual</th><th></th></tr>
        <tr *ngFor="let c of cuentas">
          <td>{{ c.nombre }}</td>
          <td>{{ c.tipoCuenta }}</td>
          <td class="numero">{{ formato(c.saldoInicial) }}</td>
          <td class="numero">{{ formato(c.saldoActual) }}</td>
          <td><button class="peligro" (click)="eliminar(c.id)">Eliminar</button></td>
        </tr>
      </table>
      <ng-template #vacio><p>Aún no tienes cuentas.</p></ng-template>
    </div>
  `
})
export class CuentasComponent implements OnInit {

  private api = inject(ApiService);
  private auth = inject(AuthService);

  cuentas: Cuenta[] = [];
  error = '';
  mensaje = '';
  formato = formatoMoneda;
  nueva: any = { nombre: '', tipoCuenta: 'BANCO', saldoInicial: 0 };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.listarCuentas(this.auth.usuarioId()).subscribe({
      next: (p) => (this.cuentas = p.content),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  crear(): void {
    this.error = '';
    this.mensaje = '';

    const cuerpo = {
      nombre: this.nueva.nombre,
      tipoCuenta: this.nueva.tipoCuenta,
      saldoInicial: this.nueva.saldoInicial,
      saldoActual: this.nueva.saldoInicial,
      moneda: 'PEN',
      usuario: { id: this.auth.usuarioId() }
    };

    this.api.crearCuenta(cuerpo).subscribe({
      next: () => {
        this.mensaje = 'Cuenta creada';
        this.nueva = { nombre: '', tipoCuenta: 'BANCO', saldoInicial: 0 };
        this.cargar();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  eliminar(id: number): void {
    this.error = '';
    this.mensaje = '';

    this.api.eliminarCuenta(id).subscribe({
      next: () => {
        this.mensaje = 'Cuenta eliminada';
        this.cargar();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }
}
