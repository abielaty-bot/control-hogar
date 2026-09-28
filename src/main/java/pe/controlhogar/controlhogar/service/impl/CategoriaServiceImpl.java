package pe.controlhogar.controlhogar.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.controlhogar.controlhogar.entity.Categoria;
import pe.controlhogar.controlhogar.entity.Usuario;
import pe.controlhogar.controlhogar.repository.CategoriaRepository;
import pe.controlhogar.controlhogar.repository.UsuarioRepository;
import pe.controlhogar.controlhogar.service.CategoriaService;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public CategoriaServiceImpl(
            CategoriaRepository categoriaRepository,
            UsuarioRepository usuarioRepository) {
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<Categoria> listarPorUsuario(Long usuarioId) {
        buscarUsuarioActivo(usuarioId);

        return categoriaRepository
                .findByUsuarioIdAndActivoTrueOrderByNombreAsc(usuarioId);
    }

    @Override
    public Categoria buscarPorId(Long id) {
        return categoriaRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una categoría activa con el ID " + id));
    }

    @Override
    public Categoria guardar(Categoria categoria) {
        validarUsuarioRecibido(categoria);

        Long usuarioId = categoria.getUsuario().getId();
        Usuario usuario = buscarUsuarioActivo(usuarioId);

        normalizarDatos(categoria);

        boolean nombreDuplicado = categoriaRepository.existsByUsuarioIdAndNombreIgnoreCase(
                usuarioId,
                categoria.getNombre());

        if (nombreDuplicado) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El usuario ya tiene una categoría con ese nombre");
        }

        categoria.setId(null);
        categoria.setUsuario(usuario);
        categoria.setActivo(true);

        return categoriaRepository.save(categoria);
    }

    @Override
    public Categoria actualizar(Long id, Categoria datos) {
        Categoria categoriaActual = buscarPorId(id);

        validarUsuarioRecibido(datos);

        Long usuarioIdRecibido = datos.getUsuario().getId();
        Long usuarioIdPropietario = categoriaActual.getUsuario().getId();

        if (!usuarioIdPropietario.equals(usuarioIdRecibido)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede cambiar el propietario de la categoría");
        }

        normalizarDatos(datos);

        boolean nombreDuplicado = categoriaRepository
                .existsByUsuarioIdAndNombreIgnoreCaseAndIdNot(
                        usuarioIdPropietario,
                        datos.getNombre(),
                        id);

        if (nombreDuplicado) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El usuario ya tiene otra categoría con ese nombre");
        }

        categoriaActual.setNombre(datos.getNombre());
        categoriaActual.setDescripcion(datos.getDescripcion());

        return categoriaRepository.save(categoriaActual);
    }

    @Override
    public void eliminar(Long id) {
        Categoria categoria = buscarPorId(id);

        categoria.setActivo(false);
        categoriaRepository.save(categoria);
    }

    private Usuario buscarUsuarioActivo(Long usuarioId) {
        return usuarioRepository.findByIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un usuario activo con el ID "
                                + usuarioId));
    }

    private void validarUsuarioRecibido(Categoria categoria) {
        if (categoria.getUsuario() == null
                || categoria.getUsuario().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el ID del usuario propietario");
        }
    }

    private void normalizarDatos(Categoria categoria) {
        if (categoria.getNombre() != null) {
            categoria.setNombre(categoria.getNombre().trim());
        }

        if (categoria.getDescripcion() != null) {
            String descripcion = categoria.getDescripcion().trim();

            categoria.setDescripcion(
                    descripcion.isEmpty() ? null : descripcion);
        }
    }
}