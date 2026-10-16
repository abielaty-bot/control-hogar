package pe.controlhogar.controlhogar.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import pe.controlhogar.controlhogar.entity.Usuario;
import pe.controlhogar.controlhogar.repository.UsuarioRepository;

/**
 * Autenticacion personalizada (Tema 7): los usuarios se cargan desde la
 * tabla usuario usando el correo como nombre de usuario. La contrasena
 * guardada (password_hash) ya viene cifrada con BCrypt.
 */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String correo)
            throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No existe un usuario con el correo " + correo));

        return User.builder()
                .username(usuario.getCorreo())
                .password(usuario.getPasswordHash())
                .roles("USER")
                .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
                .build();
    }
}
