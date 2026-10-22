package pe.controlhogar.controlhogar.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint publico de salud (health check).
 *
 * Responde sin autenticacion para que un monitoreo externo
 * (el vigia de GitHub Actions) compruebe que la API esta viva.
 *
 * Ademas toca la base de datos con un SELECT 1: en los planes
 * gratuitos duermen TANTO Render (la API) como Neon (la base),
 * y asi cada visita del vigia mantiene despiertas las dos capas.
 * Sin esto, el primer ingreso del dia pagaba el despertar de
 * la base (mas de 12 segundos medidos).
 */
@RestController
@RequestMapping("/api/salud")
public class SaludController {

    private static final Logger log = LoggerFactory.getLogger(SaludController.class);

    private final JdbcTemplate jdbc;

    public SaludController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> salud() {
        String base = "OK";
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
        } catch (Exception e) {
            base = "ERROR";
            log.warn("La comprobacion de salud no pudo tocar la base: {}", e.getMessage());
        }

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("estado", "OK");
        cuerpo.put("servicio", "Control Hogar API");
        cuerpo.put("baseDeDatos", base);
        cuerpo.put("instante", LocalDateTime.now().toString());
        return ResponseEntity.ok(cuerpo);
    }
}
