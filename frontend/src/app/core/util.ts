// Utilidades compartidas por los componentes.

// Traduce cualquier error de la peticion a un mensaje amable en
// espanol. Nunca devuelve el texto crudo de Angular (en ingles).
export function mensajeDeError(e: any): string {
  // Tiempo de espera agotado (rxjs timeout): tipico cuando el
  // servidor gratuito esta despertando.
  if (e?.name === 'TimeoutError') {
    return 'El servidor está tardando demasiado en responder (puede estar despertando). Espera unos segundos e inténtalo de nuevo.';
  }

  // Sin respuesta del servidor: red caida o servidor dormido.
  if (e?.status === 0 || e?.status === undefined) {
    return 'Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  }

  if (e?.status === 401) {
    return 'Sesión no válida o credenciales incorrectas';
  }

  if (e?.status === 429) {
    return 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.';
  }

  if (e?.status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }

  if (e?.status >= 500) {
    return 'Algo falló en el servidor. Inténtalo de nuevo en unos segundos.';
  }

  // Errores de validacion del backend (ProblemDetail en espanol).
  return e?.error?.detail || 'Ocurrió un error inesperado';
}

// Es un error de conexion (vale la pena ofrecer "Reintentar").
export function esErrorDeConexion(e: any): boolean {
  return e?.name === 'TimeoutError' || e?.status === 0 || e?.status === undefined;
}

// Fecha de hoy en formato yyyy-MM-dd usando la hora local.
export function fechaHoy(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Formato de moneda para soles.
export function formatoMoneda(valor: number): string {
  return `S/ ${Number(valor ?? 0).toFixed(2)}`;
}

// Monto corto para ejes de graficos: S/ 950, S/ 1.2k, S/ 3k.
export function formatoMontoCorto(valor: number): string {
  const v = Number(valor ?? 0);
  if (Math.abs(v) >= 1000) {
    const k = v / 1000;
    return `S/ ${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `S/ ${Math.round(v)}`;
}
