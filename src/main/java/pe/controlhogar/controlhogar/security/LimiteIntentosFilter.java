package pe.controlhogar.controlhogar.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Limite de intentos de ingreso (defensa contra fuerza bruta,
 * OWASP A07). Corre dentro de la cadena de seguridad, antes de la
 * autenticacion basica, y solo actua sobre peticiones que traen
 * credenciales (Authorization: Basic).
 *
 * Reglas:
 * - 5 ingresos fallidos (HTTP 401) del mismo correo + IP dentro de
 *   5 minutos activan un bloqueo temporal de 5 minutos (HTTP 429).
 * - Un ingreso correcto limpia el contador de esa clave.
 * - Cada fallo y cada bloqueo quedan en el registro (log) con
 *   fecha, correo e IP. JAMAS se registra la contraseña.
 *
 * El estado vive en memoria: se reinicia con cada despliegue,
 * lo cual es aceptable para el alcance de este proyecto.
 */
@Component
public class LimiteIntentosFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(LimiteIntentosFilter.class);

    static final int MAX_FALLOS = 5;
    static final long VENTANA_MS = 5 * 60 * 1000L;
    static final long BLOQUEO_MS = 5 * 60 * 1000L;

    private static class Registro {
        final Deque<Long> fallos = new ConcurrentLinkedDeque<>();
        volatile long bloqueadoHasta = 0L;
    }

    private final ConcurrentHashMap<String, Registro> registros =
            new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        String correo = extraerCorreo(request);
        if (correo == null) {
            // Sin credenciales Basic no es un intento de ingreso.
            chain.doFilter(request, response);
            return;
        }

        String ip = extraerIp(request);
        String clave = correo + '|' + ip;
        Registro registro =
                registros.computeIfAbsent(clave, k -> new Registro());

        if (registro.bloqueadoHasta > System.currentTimeMillis()) {
            log.warn("Ingreso rechazado por bloqueo temporal: "
                    + "correo={} ip={} instante={}", correo, ip, Instant.now());
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"detail\":\"Demasiados intentos "
                    + "fallidos. Espera unos minutos e inténtalo de nuevo.\"}");
            return;
        }

        chain.doFilter(request, response);

        int estado = response.getStatus();
        if (estado == HttpServletResponse.SC_UNAUTHORIZED) {
            registrarFallo(registro, correo, ip);
        } else if (estado >= 200 && estado < 400) {
            // Ingreso correcto: el contador de esa clave se limpia.
            registro.fallos.clear();
        }
    }

    private void registrarFallo(Registro registro, String correo, String ip) {
        long ahora = System.currentTimeMillis();
        registro.fallos.addLast(ahora);
        while (!registro.fallos.isEmpty()
                && ahora - registro.fallos.peekFirst() > VENTANA_MS) {
            registro.fallos.pollFirst();
        }
        log.warn("Intento de ingreso fallido: correo={} ip={} instante={} "
                + "fallosEnVentana={}",
                correo, ip, Instant.now(), registro.fallos.size());
        if (registro.fallos.size() >= MAX_FALLOS) {
            registro.bloqueadoHasta = ahora + BLOQUEO_MS;
            registro.fallos.clear();
            log.warn("Bloqueo temporal activado: correo={} ip={} minutos={}",
                    correo, ip, BLOQUEO_MS / 60000);
        }
    }

    // Correo del encabezado Basic (la parte antes de ':').
    // Devuelve null si no hay credenciales o vienen mal formadas.
    // La contraseña solo se decodifica para descartarla: no se usa
    // ni se registra en ninguna parte.
    private String extraerCorreo(HttpServletRequest request) {
        String cabecera = request.getHeader("Authorization");
        if (cabecera == null || !cabecera.startsWith("Basic ")) {
            return null;
        }
        try {
            String decodificado = new String(
                    Base64.getDecoder().decode(cabecera.substring(6)),
                    StandardCharsets.UTF_8);
            int corte = decodificado.indexOf(':');
            if (corte <= 0) {
                return null;
            }
            return decodificado.substring(0, corte).trim().toLowerCase();
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    // IP real del cliente: detras del proxy de Render viene en
    // X-Forwarded-For (la primera de la lista).
    private String extraerIp(HttpServletRequest request) {
        String reenviado = request.getHeader("X-Forwarded-For");
        if (reenviado != null && !reenviado.isBlank()) {
            return reenviado.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
