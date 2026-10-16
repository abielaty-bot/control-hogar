package pe.controlhogar.controlhogar.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.controlhogar.controlhogar.entity.Cuenta;
import pe.controlhogar.controlhogar.entity.Usuario;
import pe.controlhogar.controlhogar.repository.CuentaRepository;
import pe.controlhogar.controlhogar.repository.UsuarioRepository;
import pe.controlhogar.controlhogar.service.CuentaService;

@Service
public class CuentaServiceImpl implements CuentaService {

    private final CuentaRepository cuentaRepository;
    private final UsuarioRepository usuarioRepository;

    public CuentaServiceImpl(
            CuentaRepository cuentaRepository,
            UsuarioRepository usuarioRepository) {
        this.cuentaRepository = cuentaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Page<Cuenta> listarPorUsuario(
            Long usuarioId,
            Pageable pageable) {
        buscarUsuarioActivo(usuarioId);

        return cuentaRepository
                .findByUsuarioIdAndActivoTrue(usuarioId, pageable);
    }

    @Override
    public Cuenta buscarPorId(Long id) {
        return cuentaRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una cuenta activa con el ID " + id));
    }

    @Override
    public Cuenta guardar(Cuenta cuenta) {
        validarUsuarioRecibido(cuenta);

        Long usuarioId = cuenta.getUsuario().getId();
        Usuario usuario = buscarUsuarioActivo(usuarioId);

        normalizarDatos(cuenta);

        if (cuentaRepository.existsByUsuarioIdAndNombreIgnoreCase(
                usuarioId,
                cuenta.getNombre())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El usuario ya tiene una cuenta con ese nombre");
        }

        cuenta.setId(null);
        cuenta.setUsuario(usuario);
        cuenta.setActivo(true);

        return cuentaRepository.save(cuenta);
    }

    @Override
    public Cuenta actualizar(Long id, Cuenta datos) {
        Cuenta cuentaActual = buscarPorId(id);

        validarUsuarioRecibido(datos);

        if (!cuentaActual.getUsuario().getId()
                .equals(datos.getUsuario().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede cambiar el propietario de la cuenta");
        }

        normalizarDatos(datos);

        if (cuentaRepository.existsByUsuarioIdAndNombreIgnoreCaseAndIdNot(
                cuentaActual.getUsuario().getId(),
                datos.getNombre(),
                id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El usuario ya tiene otra cuenta con ese nombre");
        }

        cuentaActual.setNombre(datos.getNombre());
        cuentaActual.setTipoCuenta(datos.getTipoCuenta());
        cuentaActual.setSaldoInicial(datos.getSaldoInicial());
        cuentaActual.setSaldoActual(datos.getSaldoActual());
        cuentaActual.setMoneda(datos.getMoneda());

        return cuentaRepository.save(cuentaActual);
    }

    @Override
    public void eliminar(Long id) {
        Cuenta cuenta = buscarPorId(id);

        cuenta.setActivo(false);
        cuentaRepository.save(cuenta);
    }

    private Usuario buscarUsuarioActivo(Long usuarioId) {
        return usuarioRepository.findByIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró un usuario activo con el ID "
                                + usuarioId));
    }

    private void validarUsuarioRecibido(Cuenta cuenta) {
        if (cuenta.getUsuario() == null
                || cuenta.getUsuario().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el ID del usuario propietario");
        }
    }

    private void normalizarDatos(Cuenta cuenta) {
        if (cuenta.getNombre() != null) {
            cuenta.setNombre(cuenta.getNombre().trim());
        }

        if (cuenta.getTipoCuenta() != null) {
            cuenta.setTipoCuenta(cuenta.getTipoCuenta().trim());
        }

        if (cuenta.getMoneda() != null) {
            cuenta.setMoneda(cuenta.getMoneda().trim().toUpperCase());
        }
    }
}
