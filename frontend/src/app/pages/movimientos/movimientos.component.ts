import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Categoria, Cuenta, Movimiento } from '../../core/models';
import { fechaHoy, formatoMoneda, mensajeDeError } from '../../core/util';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Movimientos</h2>

    <div class="error" *ngIf="error">{{ error }}</div>
    <div class="ok" *ngIf="mensaje">{{ mensaje }}</div>

    <div class="tarjeta">
      <h3>Registrar movimiento</h3>
      <form (ngSubmit)="crear()">
        <div class="fila-form">
          <div>
            <label>Tipo</label>
            <select [(ngModel)]="nuevo.tipo" name="tipo">
              <option value="GASTO">Gasto</option>
              <option value="INGRESO">Ingreso</option>
            </select>
          </div>
          <div>
            <label>Fecha</label>
            <input type="date" [(ngModel)]="nuevo.fecha" name="fecha" required>
          </div>
          <div>
            <label>Monto total (S/)</label>
            <input type="number" step="0.01" min="0.01" [(ngModel)]="nuevo.montoTotal"
                   name="montoTotal" required placeholder="0.00">
          </div>
          <div>
            <label>Categoría</label>
            <select [(ngModel)]="nuevo.categoriaId" name="categoriaId">
              <option [ngValue]="null">Sin categoría</option>
              <option *ngFor="let c of categorias" [ngValue]="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div>
            <label>Cuenta</label>
            <select [(ngModel)]="nuevo.cuentaId" name="cuentaId">
              <option [ngValue]="null">Sin cuenta</option>
              <option *ngFor="let c of cuentas" [ngValue]="c.id">{{ c.nombre }}</option>
            </select>
          </div>
        </div>
        <label>Descripción</label>
        <input type="text" [(ngModel)]="nuevo.descripcion" name="descripcion"
               required placeholder="Ej.: Compra semanal en el mercado">
        <button type="submit">Guardar movimiento</button>
      </form>
    </div>

    <div class="tarjeta">
      <h3>Historial</h3>
      <table *ngIf="movimientos.length; else vacio">
        <tr>
          <th>Fecha</th><th>Descripción</th><th>Categoría</th>
          <th>Tipo</th><th class="numero">Monto</th><th></th>
        </tr>
        <tr *ngFor="let m of movimientos">
          <td>{{ m.fecha }}</td>
          <td>{{ m.descripcion }}</td>
          <td>{{ m.categoria?.nombre || '—' }}</td>
          <td>{{ m.tipo }}</td>
          <td class="numero">{{ formato(m.montoTotal) }}</td>
          <td><button class="peligro" (click)="eliminar(m.id)">Eliminar</button></td>
        </tr>
      </table>
      <ng-template #vacio><p>No hay movimientos en esta página.</p></ng-template>

      <p style="margin-top:12px">
        <button class="secundario" (click)="cambiarPagina(-1)" [disabled]="pagina === 0">Anterior</button>
        Página {{ pagina + 1 }} de {{ totalPaginas }}
        <button class="secundario" (click)="cambiarPagina(1)"
                [disabled]="pagina + 1 >= totalPaginas">Siguiente</button>
      </p>
    </div>
  `
})
export class MovimientosComponent implements OnInit {

  private api = inject(ApiService);
  private auth = inject(AuthService);

  movimientos: Movimiento[] = [];
  categorias: Categoria[] = [];
  cuentas: Cuenta[] = [];
  pagina = 0;
  totalPaginas = 0;
  error = '';
  mensaje = '';

  formato = formatoMoneda;

  nuevo: any = {
    tipo: 'GASTO',
    descripcion: '',
    montoTotal: null,
    fecha: fechaHoy(),
    categoriaId: null,
    cuentaId: null
  };

  ngOnInit(): void {
    const usuarioId = this.auth.usuarioId();

    this.api.listarCategorias(usuarioId).subscribe({
      next: (p) => (this.categorias = p.content)
    });
    this.api.listarCuentas(usuarioId).subscribe({
      next: (p) => (this.cuentas = p.content)
    });
    this.cargar(0);
  }

  cargar(pagina: number): void {
    this.api.listarMovimientos(this.auth.usuarioId(), pagina, 10).subscribe({
      next: (p) => {
        this.movimientos = p.content;
        this.pagina = p.number;
        this.totalPaginas = p.totalPages;
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  cambiarPagina(delta: number): void {
    this.cargar(this.pagina + delta);
  }

  crear(): void {
    this.error = '';
    this.mensaje = '';

    const cuerpo: any = {
      tipo: this.nuevo.tipo,
      descripcion: this.nuevo.descripcion,
      montoTotal: this.nuevo.montoTotal,
      fecha: this.nuevo.fecha,
      usuario: { id: this.auth.usuarioId() },
      categoria: this.nuevo.categoriaId ? { id: this.nuevo.categoriaId } : null,
      cuenta: this.nuevo.cuentaId ? { id: this.nuevo.cuentaId } : null
    };

    this.api.crearMovimiento(cuerpo).subscribe({
      next: () => {
        this.mensaje = 'Movimiento registrado';
        this.nuevo.descripcion = '';
        this.nuevo.montoTotal = null;
        this.cargar(0);
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  eliminar(id: number): void {
    this.error = '';
    this.mensaje = '';

    this.api.eliminarMovimiento(id).subscribe({
      next: () => {
        this.mensaje = 'Movimiento eliminado';
        this.cargar(this.pagina);
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }
}
