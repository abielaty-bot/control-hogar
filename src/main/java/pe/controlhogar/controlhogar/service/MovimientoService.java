package pe.controlhogar.controlhogar.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import pe.controlhogar.controlhogar.entity.Movimiento;

public interface MovimientoService {

    Page<Movimiento> listarPorUsuario(Long usuarioId, Pageable pageable);

    Movimiento buscarPorId(Long id);

    Movimiento guardar(Movimiento movimiento);

    Movimiento actualizar(Long id, Movimiento datos);

    void eliminar(Long id);
}
