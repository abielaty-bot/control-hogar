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
 * OWASP A07: fallos de autenticacion). Corre dentro de la cadena
 * de seguridad, antes de la autenticacion basica, y solo actua
 * sobre peticiones que traen credenciales (Authorization: Basic).
 *
 * Esquema de bloqueo progresivo (recomendacion OWASP):
 * - 5 ingresos fallidos (HTTP 401) del mismo correo + IP dentro
 *   de 5 minutos activan un bloqueo temporal.
 * - La duracion escala en cada bloqueo: 1, 5, 15 y 30 minutos.
 * - Mientras dura el bloqueo se responde HTTP 429 con la cabecera
 *   Retry-After y el campo reintentarEnSegundos, para que el
 *   cliente muestre la cuenta regresiva exacta.
 * - Un ingreso correcto limpia el contador y el nivel de bloqueo.
 * - Si pasa 1 hora sin actividad, el nivel vuelve a cero.
 * - Cada fallo y cada bloqueo quedan en el registro (log) con
 *   fecha, correo e IP. JAMAS se registra la contrasena.
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
    // Duraciones del bloqueo progresivo: 1, 5, 15 y 30 minutos.
    static final long[] DURACIONES_MS = {
            60 * 1000L, 5 * 60 * 1000L, 15 * 60 * 1000L, 30 * 60 * 1000L };
    static final long EXPIRA_NIVEL_MS = 60 * 60 * 1000L;

    private static class Registro {
        final Deque<Long> fallos = new ConcurrentLinkedDeque<>();
        volatile long bloqueadoHasta = 0L;
        volatile int nivel = 0;
        volatile long ultimaActividad = 0L;
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

        long ahora = System.currentTimeMillis();
        // Sin actividad por una hora, el nivel de bloqueo caduca.
        if (registro.bloqueadoHasta <= ahora
                && ahora - registro.ultimaActividad > EXPIRA_NIVEL_MS) {
            registro.nivel = 0;
        }
        registro.ultimaActividad = ahora;

        if (registro.bloqueadoHasta > ahora) {
            long restanteMs = registro.bloqueadoHasta - ahora;
            long segundos = (restanteMs + 999) / 1000;
            log.warn("Ingreso rechazado por bloqueo temporal: "
                    + "correo={} ip={} instante={} restanteSegundos={}",
                    correo, ip, Instant.now(), segundos);
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(segundos));
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"detail\":\"Demasiados intentos "
                    + "fallidos. Espera unos minutos e inténtalo de nuevo.\","
                    + "\"reintentarEnSegundos\":" + segundos + "}");
            return;
        }

        chain.doFilter(request, response);

        int estado = response.getStatus();
        if (estado == HttpServletResponse.SC_UNAUTHORIZED) {
            registrarFallo(registro, correo, ip);
        } else if (estado >= 200 && estado < 400) {
            // Ingreso correcto: contador y nivel vuelven a cero.
            registro.fallos.clear();
            registro.nivel = 0;
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
            int indice = Math.min(registro.nivel, DURACIONES_MS.length - 1);
            long duracion = DURACIONES_MS[indice];
            registro.bloqueadoHasta = ahora + duracion;
            registro.nivel++;
            registro.fallos.clear();
            log.warn("Bloqueo temporal activado: correo={} ip={} "
                    + "duracionSegundos={} nivel={}",
                    correo, ip, duracion / 1000, registro.nivel);
        }
    }

    // Correo del encabezado Basic (la parte antes de ':').
    // Devuelve null si no hay credenciales o vienen mal formadas.
    // La contrasena solo se decodifica para descartarla: no se usa
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

    // IP real del cliente: detras del proxy viene en
    // X-Forwarded-For (la primera de la lista).
    private String extraerIp(HttpServletRequest request) {
        String reenviado = request.getHeader("X-Forwarded-For");
        if (reenviado != null && !reenviado.isBlank()) {
            return reenviado.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
