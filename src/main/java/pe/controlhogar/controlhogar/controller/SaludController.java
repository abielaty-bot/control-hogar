package pe.controlhogar.controlhogar.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint publico de salud (health check).
 *
 * Responde sin autenticacion para que un monitoreo externo
 * (el vigia de GitHub Actions) compruebe que la API esta viva
 * y la mantenga despierta en el plan gratuito de Render.
 * No toca la base de datos: solo confirma que el servidor responde.
 */
@RestController
@RequestMapping("/api/salud")
public class SaludController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> salud() {
        return ResponseEntity.ok(Map.of(
                "estado", "OK",
                "servicio", "Control Hogar API",
                "instante", LocalDateTime.now().toString()));
    }
}
