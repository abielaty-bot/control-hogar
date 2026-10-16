package pe.controlhogar.controlhogar.controller;

import java.util.List;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pe.controlhogar.controlhogar.dto.TotalPorCategoriaDTO;
import pe.controlhogar.controlhogar.service.ReporteService;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    // Totales JPQL por categoria: /api/reportes/movimientos/total-por-categoria?usuarioId=1&tipo=GASTO
    @GetMapping("/movimientos/total-por-categoria")
    public ResponseEntity<List<TotalPorCategoriaDTO>> totalPorCategoria(
            @RequestParam Long usuarioId,
            @RequestParam(defaultValue = "GASTO") String tipo) {
        return ResponseEntity.ok(
                reporteService.totalPorCategoria(usuarioId, tipo));
    }

    @GetMapping(value = "/usuarios/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generarReporteUsuarios() {

        byte[] reportePdf = reporteService.generarReporteUsuariosPdf();

        ContentDisposition disposicion = ContentDisposition
                .attachment()
                .filename("reporte-usuarios.pdf")
                .build();

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposicion.toString())
                .contentLength(reportePdf.length)
                .body(reportePdf);
    }
}