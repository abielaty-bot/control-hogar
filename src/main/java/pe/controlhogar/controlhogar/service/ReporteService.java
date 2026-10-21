package pe.controlhogar.controlhogar.service;

import java.util.List;

import pe.controlhogar.controlhogar.dto.TotalPorCategoriaDTO;

public interface ReporteService {

    byte[] generarReporteUsuariosPdf();

    byte[] generarReporteMovimientosPdf(Long usuarioId, String tipo);

    List<TotalPorCategoriaDTO> totalPorCategoria(Long usuarioId, String tipo);
}