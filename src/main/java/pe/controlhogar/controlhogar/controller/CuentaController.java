package pe.controlhogar.controlhogar.controller;

import java.net.URI;

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
import pe.controlhogar.controlhogar.entity.Cuenta;
import pe.controlhogar.controlhogar.service.CuentaService;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    // Listado paginado: ?usuarioId=1&page=0&size=10&sort=nombre,asc
    @GetMapping
    public ResponseEntity<Page<Cuenta>> listarPorUsuario(
            @RequestParam Long usuarioId,
            @PageableDefault(sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(
                cuentaService.listarPorUsuario(usuarioId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cuenta> buscarPorId(
            @PathVariable Long id) {
        return ResponseEntity.ok(cuentaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Cuenta> guardar(
            @Valid @RequestBody Cuenta cuenta) {
        Cuenta cuentaGuardada = cuentaService.guardar(cuenta);

        URI ubicacion = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(cuentaGuardada.getId())
                .toUri();

        return ResponseEntity
                .created(ubicacion)
                .body(cuentaGuardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cuenta> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Cuenta cuenta) {
        return ResponseEntity.ok(
                cuentaService.actualizar(id, cuenta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {
        cuentaService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}
