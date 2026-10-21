package pe.controlhogar.controlhogar.dto;

import java.math.BigDecimal;

/**
 * Resultado de la consulta JPQL de totales de movimientos por categoria.
 * Se llena con la expresion "SELECT new ..." de MovimientoRepository.
 */
public record TotalPorCategoriaDTO(
        String categoria,
        BigDecimal total,
        Long cantidad) {
}
