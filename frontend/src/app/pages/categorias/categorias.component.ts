import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Categoria } from '../../core/models';
import { mensajeDeError } from '../../core/util';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Categorías</h2>

    <div class="error" *ngIf="error">{{ error }}</div>
    <div class="ok" *ngIf="mensaje">{{ mensaje }}</div>

    <div class="tarjeta">
      <h3>Nueva categoría</h3>
      <form (ngSubmit)="crear()">
        <div class="fila-form">
          <div>
            <label>Nombre</label>
            <input type="text" [(ngModel)]="nueva.nombre" name="nombre"
                   required placeholder="Ej.: Alimentación">
          </div>
          <div>
            <label>Descripción</label>
            <input type="text" [(ngModel)]="nueva.descripcion" name="descripcion"
                   placeholder="Opcional">
          </div>
        </div>
        <button type="submit">Guardar categoría</button>
      </form>
    </div>

    <div class="tarjeta">
      <table *ngIf="categorias.length; else vacio">
        <tr><th>Nombre</th><th>Descripción</th><th></th></tr>
        <tr *ngFor="let c of categorias">
          <td>{{ c.nombre }}</td>
          <td>{{ c.descripcion || '—' }}</td>
          <td><button class="peligro" (click)="eliminar(c.id)">Eliminar</button></td>
        </tr>
      </table>
      <ng-template #vacio><p>Aún no tienes categorías.</p></ng-template>
    </div>
  `
})
export class CategoriasComponent implements OnInit {

  private api = inject(ApiService);
  private auth = inject(AuthService);

  categorias: Categoria[] = [];
  error = '';
  mensaje = '';
  nueva: any = { nombre: '', descripcion: '' };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.listarCategorias(this.auth.usuarioId()).subscribe({
      next: (p) => (this.categorias = p.content),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  crear(): void {
    this.error = '';
    this.mensaje = '';

    const cuerpo = {
      nombre: this.nueva.nombre,
      descripcion: this.nueva.descripcion || null,
      usuario: { id: this.auth.usuarioId() }
    };

    this.api.crearCategoria(cuerpo).subscribe({
      next: () => {
        this.mensaje = 'Categoría creada';
        this.nueva = { nombre: '', descripcion: '' };
        this.cargar();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  eliminar(id: number): void {
    this.error = '';
    this.mensaje = '';

    this.api.eliminarCategoria(id).subscribe({
      next: () => {
        this.mensaje = 'Categoría eliminada';
        this.cargar();
      },
      error: (e) => (this.error = mensajeDeError(e))
    });
  }
}
