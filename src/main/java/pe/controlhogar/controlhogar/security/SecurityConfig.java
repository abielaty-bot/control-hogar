package pe.controlhogar.controlhogar.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuracion de Spring Security (Tema 7).
 *
 * - Contrasenas cifradas con BCrypt.
 * - Autenticacion personalizada contra la tabla usuario (UsuarioDetailsService).
 * - Un administrador guardado en memoria.
 * - API sin estado (STATELESS) con autenticacion HTTP Basic.
 * - El registro de usuarios (POST /api/usuarios) es publico; todo lo
 *   demas requiere autenticacion.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Usuario administrador en memoria (Tema 7: almacenamiento en memoria)
    @Bean
    public InMemoryUserDetailsManager usuariosEnMemoria(
            PasswordEncoder passwordEncoder) {
        return new InMemoryUserDetailsManager(
                User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .roles("ADMIN")
                        .build());
    }

    // Se intenta autenticar primero contra la base de datos y luego en memoria
    @Bean
    public AuthenticationManager authenticationManager(
            UsuarioDetailsService usuarioDetailsService,
            InMemoryUserDetailsManager usuariosEnMemoria,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider baseDatos =
                new DaoAuthenticationProvider(usuarioDetailsService);
        baseDatos.setPasswordEncoder(passwordEncoder);

        DaoAuthenticationProvider memoria =
                new DaoAuthenticationProvider(usuariosEnMemoria);
        memoria.setPasswordEncoder(passwordEncoder);

        return new ProviderManager(List.of(baseDatos, memoria));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationManager authenticationManager) throws Exception {
        http
                .authenticationManager(authenticationManager)
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sesion -> sesion
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
