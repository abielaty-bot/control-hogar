package pe.controlhogar.controlhogar.controller;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import pe.controlhogar.controlhogar.entity.Deuda;
import pe.controlhogar.controlhogar.entity.PagoDeuda;
import pe.controlhogar.controlhogar.service.DeudaService;

@RestController
@RequestMapping("/api/deudas")
public class DeudaController {

    private final DeudaService deudaService;

    public DeudaController(DeudaService deudaService) {
        this.deudaService = deudaService;
    }

    // Listado paginado: ?usuarioId=1&page=0&size=10&sort=fechaVencimiento,asc
    @GetMapping
    public ResponseEntity<Page<Deuda>> listarPorUsuario(
            @RequestParam Long usuarioId,
            @PageableDefault(sort = "fechaVencimiento") Pageable pageable) {
        return ResponseEntity.ok(
                deudaService.listarPorUsuario(usuarioId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deuda> buscarPorId(
            @PathVariable Long id) {
        return ResponseEntity.ok(deudaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Deuda> guardar(
            @RequestBody Deuda deuda) {
        Deuda deudaGuardada = deudaService.guardar(deuda);

        URI ubicacion = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(deudaGuardada.getId())
                .toUri();

        return ResponseEntity
                .created(ubicacion)
                .body(deudaGuardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deuda> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Deuda deuda) {
        return ResponseEntity.ok(
                deudaService.actualizar(id, deuda));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {
        deudaService.eliminar(id);

        return ResponseEntity.noContent().build();
    }

    // ===== Pagos de la deuda =====

    @GetMapping("/{id}/pagos")
    public ResponseEntity<List<PagoDeuda>> listarPagos(
            @PathVariable Long id) {
        return ResponseEntity.ok(deudaService.listarPagos(id));
    }

    @PostMapping("/{id}/pagos")
    public ResponseEntity<PagoDeuda> registrarPago(
            @PathVariable Long id,
            @RequestBody PagoDeuda pago) {
        PagoDeuda pagoGuardado = deudaService.registrarPago(id, pago);

        URI ubicacion = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{pagoId}")
                .buildAndExpand(pagoGuardado.getId())
                .toUri();

        return ResponseEntity
                .created(ubicacion)
                .body(pagoGuardado);
    }

    @DeleteMapping("/pagos/{pagoId}")
    public ResponseEntity<Void> eliminarPago(
            @PathVariable Long pagoId) {
        deudaService.eliminarPago(pagoId);

        return ResponseEntity.noContent().build();
    }
}
