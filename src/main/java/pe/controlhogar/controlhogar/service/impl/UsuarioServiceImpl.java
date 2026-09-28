package pe.controlhogar.controlhogar.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.controlhogar.controlhogar.entity.Usuario;
import pe.controlhogar.controlhogar.repository.UsuarioRepository;
import pe.controlhogar.controlhogar.service.UsuarioService;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<Usuario> listar() {
        return usuarioRepository.findByActivoTrueOrderByNombresAsc();
    }

    @Override
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un usuario activo con el ID " + id));
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        normalizarDatos(usuario);

        if (usuarioRepository.existsByCorreoIgnoreCase(usuario.getCorreo())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un usuario con el correo indicado");
        }

        usuario.setId(null);
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }

    @Override
    public Usuario actualizar(Long id, Usuario datos) {
        Usuario usuarioActual = buscarPorId(id);

        normalizarDatos(datos);

        if (usuarioRepository.existsByCorreoIgnoreCaseAndIdNot(
                datos.getCorreo(),
                id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo ya pertenece a otro usuario");
        }

        usuarioActual.setNombres(datos.getNombres());
        usuarioActual.setApellidoPaterno(datos.getApellidoPaterno());
        usuarioActual.setApellidoMaterno(datos.getApellidoMaterno());
        usuarioActual.setCorreo(datos.getCorreo());
        usuarioActual.setTelefono(datos.getTelefono());

        if (datos.getPasswordHash() != null
                && !datos.getPasswordHash().isBlank()) {
            usuarioActual.setPasswordHash(datos.getPasswordHash());
        }

        return usuarioRepository.save(usuarioActual);
    }

    @Override
    public void eliminar(Long id) {
        Usuario usuario = buscarPorId(id);

        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    private void normalizarDatos(Usuario usuario) {
        if (usuario.getNombres() != null) {
            usuario.setNombres(usuario.getNombres().trim());
        }

        if (usuario.getApellidoPaterno() != null) {
            usuario.setApellidoPaterno(
                    usuario.getApellidoPaterno().trim());
        }

        if (usuario.getApellidoMaterno() != null) {
            String apellidoMaterno = usuario.getApellidoMaterno().trim();

            usuario.setApellidoMaterno(
                    apellidoMaterno.isEmpty() ? null : apellidoMaterno);
        }

        if (usuario.getCorreo() != null) {
            usuario.setCorreo(
                    usuario.getCorreo().trim().toLowerCase());
        }

        if (usuario.getTelefono() != null) {
            String telefono = usuario.getTelefono().trim();

            usuario.setTelefono(
                    telefono.isEmpty() ? null : telefono);
        }
    }
}