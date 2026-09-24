package pe.controlhogar.controlhogar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import pe.controlhogar.controlhogar.entity.Movimiento;
import pe.controlhogar.controlhogar.service.MovimientoService;

@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin("*")
public class MovimientoController {

    private final MovimientoService service;

    public MovimientoController(MovimientoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Movimiento> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movimiento> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Movimiento> guardar(
            @Valid @RequestBody Movimiento movimiento) {

        return ResponseEntity.ok(service.guardar(movimiento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movimiento> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Movimiento movimiento) {

        return ResponseEntity.ok(
                service.actualizar(id, movimiento)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}