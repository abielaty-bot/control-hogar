// Utilidades compartidas por los componentes.

// Extrae el mensaje legible de un error HTTP (la API responde en formato
// ProblemDetail: el texto viene en la propiedad "detail").
export function mensajeDeError(e: any): string {
  if (e?.status === 401) {
    return 'Sesión no válida o credenciales incorrectas';
  }
  return (
    e?.error?.detail ||
    e?.error?.message ||
    e?.message ||
    'Ocurrió un error inesperado'
  );
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
