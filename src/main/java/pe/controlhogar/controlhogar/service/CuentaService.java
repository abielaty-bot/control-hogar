package pe.controlhogar.controlhogar.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import pe.controlhogar.controlhogar.entity.Cuenta;

public interface CuentaService {

    Page<Cuenta> listarPorUsuario(Long usuarioId, Pageable pageable);

    Cuenta buscarPorId(Long id);

    Cuenta guardar(Cuenta cuenta);

    Cuenta actualizar(Long id, Cuenta datos);

    void eliminar(Long id);
}
