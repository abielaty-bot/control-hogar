// Modelos que coinciden con las entidades JSON de la API REST.

export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo: string;
  telefono?: string;
  activo: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Cuenta {
  id: number;
  nombre: string;
  tipoCuenta: string;
  saldoInicial: number;
  saldoActual: number;
  moneda: string;
  activo: boolean;
}

export interface Movimiento {
  id: number;
  tipo: string;
  descripcion: string;
  montoTotal: number;
  fecha: string;
  categoria?: { id: number; nombre: string } | null;
  cuenta?: { id: number; nombre: string } | null;
}

export interface PresupuestoMensual {
  id: number;
  anio: number;
  mes: number;
  montoTotal: number;
  activo: boolean;
}

export interface PresupuestoCategoria {
  id: number;
  categoria: { id: number; nombre: string };
  montoAsignado: number;
}

export interface Deuda {
  id: number;
  nombre: string;
  descripcion?: string;
  montoTotal: number;
  saldoPendiente: number;
  fechaInicio?: string;
  fechaVencimiento?: string;
  estado: string;
}

export interface PagoDeuda {
  id: number;
  monto: number;
  fechaPago: string;
  observacion?: string;
  cuenta?: { id: number; nombre: string } | null;
}

export interface TotalPorCategoria {
  categoria: string | null;
  total: number;
  cantidad: number;
}
