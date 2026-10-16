package pe.controlhogar.controlhogar.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import pe.controlhogar.controlhogar.entity.PresupuestoCategoria;
import pe.controlhogar.controlhogar.entity.PresupuestoMensual;

public interface PresupuestoService {

    Page<PresupuestoMensual> listarPorUsuario(Long usuarioId, Pageable pageable);

    PresupuestoMensual buscarPorId(Long id);

    PresupuestoMensual guardar(PresupuestoMensual presupuesto);

    PresupuestoMensual actualizar(Long id, PresupuestoMensual datos);

    void eliminar(Long id);

    List<PresupuestoCategoria> listarDetalle(Long presupuestoId);

    PresupuestoCategoria agregarDetalle(
            Long presupuestoId,
            PresupuestoCategoria detalle);

    PresupuestoCategoria actualizarDetalle(
            Long detalleId,
            PresupuestoCategoria datos);

    void eliminarDetalle(Long detalleId);
}
