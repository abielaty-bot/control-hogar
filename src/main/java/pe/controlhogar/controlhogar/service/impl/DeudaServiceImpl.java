package pe.controlhogar.controlhogar.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pe.controlhogar.controlhogar.entity.Cuenta;
import pe.controlhogar.controlhogar.entity.Deuda;
import pe.controlhogar.controlhogar.entity.MedioPago;
import pe.controlhogar.controlhogar.entity.PagoDeuda;
import pe.controlhogar.controlhogar.entity.Usuario;
import pe.controlhogar.controlhogar.repository.CuentaRepository;
import pe.controlhogar.controlhogar.repository.DeudaRepository;
import pe.controlhogar.controlhogar.repository.MedioPagoRepository;
import pe.controlhogar.controlhogar.repository.PagoDeudaRepository;
import pe.controlhogar.controlhogar.repository.UsuarioRepository;
import pe.controlhogar.controlhogar.service.DeudaService;

@Service
public class DeudaServiceImpl implements DeudaService {

    private final DeudaRepository deudaRepository;
    private final PagoDeudaRepository pagoDeudaRepository;
    private final CuentaRepository cuentaRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final UsuarioRepository usuarioRepository;

    public DeudaServiceImpl(
            DeudaRepository deudaRepository,
            PagoDeudaRepository pagoDeudaRepository,
            CuentaRepository cuentaRepository,
            MedioPagoRepository medioPagoRepository,
            UsuarioRepository usuarioRepository) {
        this.deudaRepository = deudaRepository;
        this.pagoDeudaRepository = pagoDeudaRepository;
        this.cuentaRepository = cuentaRepository;
        this.medioPagoRepository = medioPagoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Page<Deuda> listarPorUsuario(
            Long usuarioId,
            Pageable pageable) {
        buscarUsuarioActivo(usuarioId);

        return deudaRepository.findByUsuarioId(usuarioId, pageable);
    }

    @Override
    public Deuda buscarPorId(Long id) {
        return deudaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una deuda con el ID " + id));
    }

    @Override
    public Deuda guardar(Deuda deuda) {
        validarUsuarioRecibido(deuda);

        if (deuda.getNombre() == null || deuda.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de la deuda es obligatorio");
        }

        if (deuda.getMontoTotal() == null
                || deuda.getMontoTotal().signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto total debe ser mayor que cero");
        }

        if (deuda.getSaldoPendiente() != null
                && deuda.getSaldoPendiente().signum() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El saldo pendiente no puede ser negativo");
        }

        if (deuda.getFechaInicio() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de inicio es obligatoria");
        }

        Usuario usuario = buscarUsuarioActivo(deuda.getUsuario().getId());

        deuda.setId(null);
        deuda.setUsuario(usuario);

        // Si no indican saldo pendiente, se asume la deuda completa
        if (deuda.getSaldoPendiente() == null) {
            deuda.setSaldoPendiente(deuda.getMontoTotal());
        }

        deuda.setEstado(normalizarEstado(deuda.getEstado()));

        return deudaRepository.save(deuda);
    }

    @Override
    public Deuda actualizar(Long id, Deuda datos) {
        Deuda deudaActual = buscarPorId(id);

        validarUsuarioRecibido(datos);

        if (!deudaActual.getUsuario().getId()
                .equals(datos.getUsuario().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede cambiar el propietario de la deuda");
        }

        deudaActual.setNombre(datos.getNombre());
        deudaActual.setDescripcion(datos.getDescripcion());
        deudaActual.setFechaInicio(datos.getFechaInicio());
        deudaActual.setFechaVencimiento(datos.getFechaVencimiento());
        deudaActual.setEstado(normalizarEstado(datos.getEstado()));

        // El monto y el saldo no se editan aqui: el saldo cambia con los pagos
        return deudaRepository.save(deudaActual);
    }

    @Override
    public void eliminar(Long id) {
        Deuda deuda = buscarPorId(id);

        if (pagoDeudaRepository.existsByDeudaId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar una deuda con pagos registrados");
        }

        deudaRepository.delete(deuda);
    }

    @Override
    public List<PagoDeuda> listarPagos(Long deudaId) {
        buscarPorId(deudaId);

        return pagoDeudaRepository.findByDeudaIdOrderByFechaPagoDesc(deudaId);
    }

    @Override
    @Transactional
    public PagoDeuda registrarPago(Long deudaId, PagoDeuda pago) {
        Deuda deuda = buscarPorId(deudaId);

        Cuenta cuenta = resolverCuenta(pago.getCuenta());

        if (pago.getMonto() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el monto del pago");
        }

        // Regla de negocio: la cuenta debe ser del mismo usuario de la deuda
        if (!cuenta.getUsuario().getId()
                .equals(deuda.getUsuario().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta no pertenece al usuario de la deuda");
        }

        // Regla de negocio: el pago no puede superar el saldo pendiente
        if (pago.getMonto() != null
                && pago.getMonto().compareTo(deuda.getSaldoPendiente()) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El pago supera el saldo pendiente de la deuda");
        }

        pago.setId(null);
        pago.setDeuda(deuda);
        pago.setCuenta(cuenta);
        pago.setMedioPago(resolverMedioPago(pago.getMedioPago()));

        if (pago.getFechaPago() == null) {
            pago.setFechaPago(LocalDate.now());
        }

        PagoDeuda pagoGuardado = pagoDeudaRepository.save(pago);

        // El pago descuenta el saldo; si llega a cero, la deuda queda PAGADA
        deuda.setSaldoPendiente(
                deuda.getSaldoPendiente().subtract(pago.getMonto()));

        if (deuda.getSaldoPendiente().signum() == 0) {
            deuda.setEstado("PAGADA");
        }

        deudaRepository.save(deuda);

        return pagoGuardado;
    }

    @Override
    @Transactional
    public void eliminarPago(Long pagoId) {
        PagoDeuda pago = pagoDeudaRepository.findById(pagoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un pago con el ID " + pagoId));

        Deuda deuda = pago.getDeuda();

        // Al anular el pago, el monto vuelve al saldo pendiente
        deuda.setSaldoPendiente(
                deuda.getSaldoPendiente().add(pago.getMonto()));

        if ("PAGADA".equals(deuda.getEstado())
                && deuda.getSaldoPendiente().signum() > 0) {
            deuda.setEstado("PENDIENTE");
        }

        deudaRepository.save(deuda);
        pagoDeudaRepository.delete(pago);
    }

    private Cuenta resolverCuenta(Cuenta recibida) {
        if (recibida == null || recibida.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el ID de la cuenta del pago");
        }

        return cuentaRepository.findByIdAndActivoTrue(recibida.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una cuenta activa con el ID "
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

    private Usuario buscarUsuarioActivo(Long usuarioId) {
        return usuarioRepository.findByIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un usuario activo con el ID "
                                + usuarioId));
    }

    private void validarUsuarioRecibido(Deuda deuda) {
        if (deuda.getUsuario() == null
                || deuda.getUsuario().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el ID del usuario propietario");
        }
    }

    private String normalizarEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            return "PENDIENTE";
        }

        return estado.trim().toUpperCase();
    }
}
