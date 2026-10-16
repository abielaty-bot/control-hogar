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
import pe.controlhogar.controlhogar.entity.PresupuestoCategoria;
import pe.controlhogar.controlhogar.entity.PresupuestoMensual;
import pe.controlhogar.controlhogar.service.PresupuestoService;

@RestController
@RequestMapping("/api/presupuestos")
public class PresupuestoController {

    private final PresupuestoService presupuestoService;

    public PresupuestoController(PresupuestoService presupuestoService) {
        this.presupuestoService = presupuestoService;
    }

    // Listado paginado: ?usuarioId=1&page=0&size=10&sort=anio,desc
    @GetMapping
    public ResponseEntity<Page<PresupuestoMensual>> listarPorUsuario(
            @RequestParam Long usuarioId,
            @PageableDefault(sort = "anio") Pageable pageable) {
        return ResponseEntity.ok(
                presupuestoService.listarPorUsuario(usuarioId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PresupuestoMensual> buscarPorId(
            @PathVariable Long id) {
        return ResponseEntity.ok(presupuestoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PresupuestoMensual> guardar(
            @Valid @RequestBody PresupuestoMensual presupuesto) {
        PresupuestoMensual presupuestoGuardado =
                presupuestoService.guardar(presupuesto);

        URI ubicacion = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(presupuestoGuardado.getId())
                .toUri();

        return ResponseEntity
                .created(ubicacion)
                .body(presupuestoGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PresupuestoMensual> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PresupuestoMensual presupuesto) {
        return ResponseEntity.ok(
                presupuestoService.actualizar(id, presupuesto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {
        presupuestoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }

    // ===== Detalle por categoria =====

    @GetMapping("/{id}/detalle")
    public ResponseEntity<List<PresupuestoCategoria>> listarDetalle(
            @PathVariable Long id) {
        return ResponseEntity.ok(presupuestoService.listarDetalle(id));
    }

    @PostMapping("/{id}/detalle")
    public ResponseEntity<PresupuestoCategoria> agregarDetalle(
            @PathVariable Long id,
            @Valid @RequestBody PresupuestoCategoria detalle) {
        PresupuestoCategoria detalleGuardado =
                presupuestoService.agregarDetalle(id, detalle);

        URI ubicacion = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{detalleId}")
                .buildAndExpand(detalleGuardado.getId())
                .toUri();

        return ResponseEntity
                .created(ubicacion)
                .body(detalleGuardado);
    }

    @PutMapping("/detalle/{detalleId}")
    public ResponseEntity<PresupuestoCategoria> actualizarDetalle(
            @PathVariable Long detalleId,
            @Valid @RequestBody PresupuestoCategoria detalle) {
        return ResponseEntity.ok(
                presupuestoService.actualizarDetalle(detalleId, detalle));
    }

    @DeleteMapping("/detalle/{detalleId}")
    public ResponseEntity<Void> eliminarDetalle(
            @PathVariable Long detalleId) {
        presupuestoService.eliminarDetalle(detalleId);

        return ResponseEntity.noContent().build();
    }
}
