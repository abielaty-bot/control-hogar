package pe.controlhogar.controlhogar.service.impl;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.controlhogar.controlhogar.entity.Categoria;
import pe.controlhogar.controlhogar.entity.Cuenta;
import pe.controlhogar.controlhogar.entity.MedioPago;
import pe.controlhogar.controlhogar.entity.Movimiento;
import pe.controlhogar.controlhogar.entity.Tienda;
import pe.controlhogar.controlhogar.entity.Usuario;
import pe.controlhogar.controlhogar.repository.CategoriaRepository;
import pe.controlhogar.controlhogar.repository.CuentaRepository;
import pe.controlhogar.controlhogar.repository.MedioPagoRepository;
import pe.controlhogar.controlhogar.repository.MovimientoRepository;
import pe.controlhogar.controlhogar.repository.TiendaRepository;
import pe.controlhogar.controlhogar.repository.UsuarioRepository;
import pe.controlhogar.controlhogar.service.MovimientoService;

@Service
public class MovimientoServiceImpl implements MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final CuentaRepository cuentaRepository;
    private final TiendaRepository tiendaRepository;
    private final MedioPagoRepository medioPagoRepository;

    public MovimientoServiceImpl(
            MovimientoRepository movimientoRepository,
            UsuarioRepository usuarioRepository,
            CategoriaRepository categoriaRepository,
            CuentaRepository cuentaRepository,
            TiendaRepository tiendaRepository,
            MedioPagoRepository medioPagoRepository) {
        this.movimientoRepository = movimientoRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.cuentaRepository = cuentaRepository;
        this.tiendaRepository = tiendaRepository;
        this.medioPagoRepository = medioPagoRepository;
    }

    @Override
    public Page<Movimiento> listarPorUsuario(
            Long usuarioId,
            Pageable pageable) {
        buscarUsuarioActivo(usuarioId);

        return movimientoRepository
                .findByUsuarioIdAndEliminadoEnIsNull(usuarioId, pageable);
    }

    @Override
    public Movimiento buscarPorId(Long id) {
        return movimientoRepository.findByIdAndEliminadoEnIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un movimiento vigente con el ID " + id));
    }

    @Override
    public Movimiento guardar(Movimiento movimiento) {
        validarUsuarioRecibido(movimiento);

        Usuario usuario = buscarUsuarioActivo(
                movimiento.getUsuario().getId());

        movimiento.setId(null);
        movimiento.setUsuario(usuario);
        movimiento.setCategoria(resolverCategoria(movimiento.getCategoria()));
        movimiento.setCuenta(resolverCuenta(movimiento.getCuenta()));
        movimiento.setTienda(resolverTienda(movimiento.getTienda()));
        movimiento.setMedioPago(resolverMedioPago(movimiento.getMedioPago()));
        movimiento.setEliminadoEn(null);

        return movimientoRepository.save(movimiento);
    }

    @Override
    public Movimiento actualizar(Long id, Movimiento datos) {
        Movimiento movimientoActual = buscarPorId(id);

        validarUsuarioRecibido(datos);

        if (!movimientoActual.getUsuario().getId()
                .equals(datos.getUsuario().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede cambiar el propietario del movimiento");
        }

        movimientoActual.setTipo(datos.getTipo());
        movimientoActual.setDescripcion(datos.getDescripcion());
        movimientoActual.setMontoTotal(datos.getMontoTotal());
        movimientoActual.setFecha(datos.getFecha());
        movimientoActual.setCategoria(resolverCategoria(datos.getCategoria()));
        movimientoActual.setCuenta(resolverCuenta(datos.getCuenta()));
        movimientoActual.setTienda(resolverTienda(datos.getTienda()));
        movimientoActual.setMedioPago(resolverMedioPago(datos.getMedioPago()));

        return movimientoRepository.save(movimientoActual);
    }

    @Override
    public void eliminar(Long id) {
        Movimiento movimiento = buscarPorId(id);

        // Borrado logico: se marca la fecha de eliminacion
        movimiento.setEliminadoEn(LocalDateTime.now());
        movimientoRepository.save(movimiento);
    }

    private Usuario buscarUsuarioActivo(Long usuarioId) {
        return usuarioRepository.findByIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un usuario activo con el ID "
                                + usuarioId));
    }

    private void validarUsuarioRecibido(Movimiento movimiento) {
        if (movimiento.getUsuario() == null
                || movimiento.getUsuario().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el ID del usuario propietario");
        }
    }

    private Categoria resolverCategoria(Categoria recibida) {
        if (recibida == null || recibida.getId() == null) {
            return null;
        }

        return categoriaRepository.findByIdAndActivoTrue(recibida.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una categoría activa con el ID "
                                + recibida.getId()));
    }

    private Cuenta resolverCuenta(Cuenta recibida) {
        if (recibida == null || recibida.getId() == null) {
            return null;
        }

        return cuentaRepository.findByIdAndActivoTrue(recibida.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una cuenta activa con el ID "
                                + recibida.getId()));
    }

    private Tienda resolverTienda(Tienda recibida) {
        if (recibida == null || recibida.getId() == null) {
            return null;
        }

        return tiendaRepository.findById(recibida.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una tienda con el ID "
                                + recibida.getId()));
    }

    private MedioPago resolverMedioPago(MedioPago recibido) {
        if (recibido == null || recibido.getId() == null) {
            return null;
        }

        return medioPagoRepository.findById(recibido.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un medio de pago con el ID "
                                + recibido.getId()));
    }
}
