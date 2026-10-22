package pe.controlhogar.controlhogar.service.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.controlhogar.controlhogar.entity.Categoria;
import pe.controlhogar.controlhogar.entity.PresupuestoCategoria;
import pe.controlhogar.controlhogar.entity.PresupuestoMensual;
import pe.controlhogar.controlhogar.entity.Usuario;
import pe.controlhogar.controlhogar.repository.CategoriaRepository;
import pe.controlhogar.controlhogar.repository.PresupuestoCategoriaRepository;
import pe.controlhogar.controlhogar.repository.PresupuestoMensualRepository;
import pe.controlhogar.controlhogar.repository.UsuarioRepository;
import pe.controlhogar.controlhogar.service.PresupuestoService;

@Service
public class PresupuestoServiceImpl implements PresupuestoService {

    private final PresupuestoMensualRepository presupuestoRepository;
    private final PresupuestoCategoriaRepository detalleRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public PresupuestoServiceImpl(
            PresupuestoMensualRepository presupuestoRepository,
            PresupuestoCategoriaRepository detalleRepository,
            CategoriaRepository categoriaRepository,
            UsuarioRepository usuarioRepository) {
        this.presupuestoRepository = presupuestoRepository;
        this.detalleRepository = detalleRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Page<PresupuestoMensual> listarPorUsuario(
            Long usuarioId,
            Pageable pageable) {
        buscarUsuarioActivo(usuarioId);

        return presupuestoRepository
                .findByUsuarioIdAndActivoTrue(usuarioId, pageable);
    }

    @Override
    public PresupuestoMensual buscarPorId(Long id) {
        return presupuestoRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un presupuesto activo con el ID " + id));
    }

    @Override
    public PresupuestoMensual guardar(PresupuestoMensual presupuesto) {
        validarUsuarioRecibido(presupuesto);

        Long usuarioId = presupuesto.getUsuario().getId();
        Usuario usuario = buscarUsuarioActivo(usuarioId);

        if (presupuestoRepository.existsByUsuarioIdAndAnioAndMes(
                usuarioId,
                presupuesto.getAnio(),
                presupuesto.getMes())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El usuario ya tiene un presupuesto para ese año y mes");
        }

        presupuesto.setId(null);
        presupuesto.setUsuario(usuario);
        presupuesto.setActivo(true);

        return presupuestoRepository.save(presupuesto);
    }

    @Override
    public PresupuestoMensual actualizar(
            Long id,
            PresupuestoMensual datos) {
        PresupuestoMensual presupuestoActual = buscarPorId(id);

        validarUsuarioRecibido(datos);

        if (!presupuestoActual.getUsuario().getId()
                .equals(datos.getUsuario().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede cambiar el propietario del presupuesto");
        }

        if (presupuestoRepository.existsByUsuarioIdAndAnioAndMesAndIdNot(
                presupuestoActual.getUsuario().getId(),
                datos.getAnio(),
                datos.getMes(),
                id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El usuario ya tiene otro presupuesto para ese año y mes");
        }

        presupuestoActual.setAnio(datos.getAnio());
        presupuestoActual.setMes(datos.getMes());
        presupuestoActual.setMontoTotal(datos.getMontoTotal());

        return presupuestoRepository.save(presupuestoActual);
    }

    @Override
    public void eliminar(Long id) {
        PresupuestoMensual presupuesto = buscarPorId(id);

        presupuesto.setActivo(false);
        presupuestoRepository.save(presupuesto);
    }

    @Override
    public List<PresupuestoCategoria> listarDetalle(Long presupuestoId) {
        buscarPorId(presupuestoId);

        return detalleRepository.findByPresupuestoMensualId(presupuestoId);
    }

    @Override
    public PresupuestoCategoria agregarDetalle(
            Long presupuestoId,
            PresupuestoCategoria detalle) {
        PresupuestoMensual presupuesto = buscarPorId(presupuestoId);

        if (detalle.getCategoria() == null
                || detalle.getCategoria().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el ID de la categoría");
        }

        if (detalle.getMontoAsignado() == null
                || detalle.getMontoAsignado().signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto asignado debe ser mayor que cero");
        }

        Categoria categoria = categoriaRepository
                .findByIdAndActivoTrue(detalle.getCategoria().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una categoría activa con el ID "
                                + detalle.getCategoria().getId()));

        // Regla de negocio: la categoria debe ser del mismo usuario
        if (!categoria.getUsuario().getId()
                .equals(presupuesto.getUsuario().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La categoría no pertenece al usuario del presupuesto");
        }

        if (detalleRepository.existsByPresupuestoMensualIdAndCategoriaId(
                presupuestoId,
                categoria.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La categoría ya está asignada a este presupuesto");
        }

        detalle.setId(null);
        detalle.setPresupuestoMensual(presupuesto);
        detalle.setCategoria(categoria);

        return detalleRepository.save(detalle);
    }

    @Override
    public PresupuestoCategoria actualizarDetalle(
            Long detalleId,
            PresupuestoCategoria datos) {
        PresupuestoCategoria detalleActual = buscarDetalle(detalleId);

        if (datos.getMontoAsignado() == null
                || datos.getMontoAsignado().signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto asignado debe ser mayor que cero");
        }

        detalleActual.setMontoAsignado(datos.getMontoAsignado());

        return detalleRepository.save(detalleActual);
    }

    @Override
    public void eliminarDetalle(Long detalleId) {
        PresupuestoCategoria detalle = buscarDetalle(detalleId);

        detalleRepository.delete(detalle);
    }

    private PresupuestoCategoria buscarDetalle(Long detalleId) {
        return detalleRepository.findById(detalleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el detalle con el ID " + detalleId));
    }

    private Usuario buscarUsuarioActivo(Long usuarioId) {
        return usuarioRepository.findByIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un usuario activo con el ID "
                                + usuarioId));
    }

    private void validarUsuarioRecibido(PresupuestoMensual presupuesto) {
        if (presupuesto.getUsuario() == null
                || presupuesto.getUsuario().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el ID del usuario propietario");
        }
    }
}
