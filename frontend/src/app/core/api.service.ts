import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Categoria,
  Cuenta,
  Deuda,
  Movimiento,
  Pagina,
  PagoDeuda,
  PresupuestoCategoria,
  PresupuestoMensual,
  TotalPorCategoria,
  Usuario
} from './models';

// Servicio unico de acceso a la API REST de Control Hogar.
// Cada metodo corresponde a un endpoint del backend (Bloques 1 a 4).
@Injectable({ providedIn: 'root' })
export class ApiService {

  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ===== Usuarios =====

  // Registro publico (POST /api/usuarios no requiere autenticacion).
  registrarUsuario(cuerpo: unknown): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/usuarios`, cuerpo);
  }

  // Ping de salud publico: mantiene activa la conexion con el
  // servidor mientras el usuario escribe en el login.
  salud(): Observable<unknown> {
    return this.http.get(`${this.base}/salud`);
  }

  // ===== Categorias =====

  listarCategorias(usuarioId: number): Observable<Pagina<Categoria>> {
    return this.http.get<Pagina<Categoria>>(
      `${this.base}/categorias?usuarioId=${usuarioId}&page=0&size=100&sort=nombre,asc`);
  }

  crearCategoria(cuerpo: unknown): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.base}/categorias`, cuerpo);
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categorias/${id}`);
  }

  // ===== Cuentas =====

  listarCuentas(usuarioId: number): Observable<Pagina<Cuenta>> {
    return this.http.get<Pagina<Cuenta>>(
      `${this.base}/cuentas?usuarioId=${usuarioId}&page=0&size=100&sort=nombre,asc`);
  }

  crearCuenta(cuerpo: unknown): Observable<Cuenta> {
    return this.http.post<Cuenta>(`${this.base}/cuentas`, cuerpo);
  }

  eliminarCuenta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/cuentas/${id}`);
  }

  // ===== Movimientos =====

  listarMovimientos(usuarioId: number, pagina = 0, tamano = 10): Observable<Pagina<Movimiento>> {
    return this.http.get<Pagina<Movimiento>>(
      `${this.base}/movimientos?usuarioId=${usuarioId}&page=${pagina}&size=${tamano}`);
  }

  crearMovimiento(cuerpo: unknown): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.base}/movimientos`, cuerpo);
  }

  eliminarMovimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/movimientos/${id}`);
  }

  // ===== Presupuestos =====

  listarPresupuestos(usuarioId: number): Observable<Pagina<PresupuestoMensual>> {
    return this.http.get<Pagina<PresupuestoMensual>>(
      `${this.base}/presupuestos?usuarioId=${usuarioId}&page=0&size=100&sort=anio,desc`);
  }

  crearPresupuesto(cuerpo: unknown): Observable<PresupuestoMensual> {
    return this.http.post<PresupuestoMensual>(`${this.base}/presupuestos`, cuerpo);
  }

  eliminarPresupuesto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/presupuestos/${id}`);
  }

  listarDetallePresupuesto(presupuestoId: number): Observable<PresupuestoCategoria[]> {
    return this.http.get<PresupuestoCategoria[]>(
      `${this.base}/presupuestos/${presupuestoId}/detalle`);
  }

  agregarDetallePresupuesto(presupuestoId: number, cuerpo: unknown): Observable<PresupuestoCategoria> {
    return this.http.post<PresupuestoCategoria>(
      `${this.base}/presupuestos/${presupuestoId}/detalle`, cuerpo);
  }

  eliminarDetallePresupuesto(detalleId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/presupuestos/detalle/${detalleId}`);
  }

  // ===== Deudas y pagos =====

  listarDeudas(usuarioId: number): Observable<Pagina<Deuda>> {
    return this.http.get<Pagina<Deuda>>(
      `${this.base}/deudas?usuarioId=${usuarioId}&page=0&size=100&sort=fechaVencimiento,asc`);
  }

  crearDeuda(cuerpo: unknown): Observable<Deuda> {
    return this.http.post<Deuda>(`${this.base}/deudas`, cuerpo);
  }

  eliminarDeuda(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/deudas/${id}`);
  }

  listarPagos(deudaId: number): Observable<PagoDeuda[]> {
    return this.http.get<PagoDeuda[]>(`${this.base}/deudas/${deudaId}/pagos`);
  }

  registrarPago(deudaId: number, cuerpo: unknown): Observable<PagoDeuda> {
    return this.http.post<PagoDeuda>(`${this.base}/deudas/${deudaId}/pagos`, cuerpo);
  }

  eliminarPago(pagoId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/deudas/pagos/${pagoId}`);
  }

  // ===== Reportes =====

  totalesPorCategoria(usuarioId: number, tipo: string): Observable<TotalPorCategoria[]> {
    return this.http.get<TotalPorCategoria[]>(
      `${this.base}/reportes/movimientos/total-por-categoria?usuarioId=${usuarioId}&tipo=${tipo}`);
  }

  descargarPdfMovimientos(usuarioId: number, tipo: string): Observable<Blob> {
    return this.http.get(
      `${this.base}/reportes/movimientos/pdf?usuarioId=${usuarioId}&tipo=${tipo}`,
      { responseType: 'blob' });
  }
}
