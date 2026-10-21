package pe.controlhogar.controlhogar.controller;

import java.net.URI;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import pe.controlhogar.controlhogar.entity.Movimiento;
import pe.controlhogar.controlhogar.service.MovimientoService;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }

    // Listado paginado: ?usuarioId=1&page=0&size=10 (orden: fecha descendente)
    @GetMapping
    public ResponseEntity<Page<Movimiento>> listarPorUsuario(
            @RequestParam Long usuarioId,
            @PageableDefault(sort = "fecha", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(
                movimientoService.listarPorUsuario(usuarioId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movimiento> buscarPorId(
            @PathVariable Long id) {
        return ResponseEntity.ok(movimientoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Movimiento> guardar(
            @Valid @RequestBody Movimiento movimiento) {
        Movimiento movimientoGuardado = movimientoService.guardar(movimiento);

        URI ubicacion = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(movimientoGuardado.getId())
                .toUri();

        return ResponseEntity
                .created(ubicacion)
                .body(movimientoGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movimiento> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Movimiento movimiento) {
        return ResponseEntity.ok(
                movimientoService.actualizar(id, movimiento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {
        movimientoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}
