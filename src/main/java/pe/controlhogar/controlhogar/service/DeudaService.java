package pe.controlhogar.controlhogar.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import pe.controlhogar.controlhogar.entity.Deuda;
import pe.controlhogar.controlhogar.entity.PagoDeuda;

public interface DeudaService {

    Page<Deuda> listarPorUsuario(Long usuarioId, Pageable pageable);

    Deuda buscarPorId(Long id);

    Deuda guardar(Deuda deuda);

    Deuda actualizar(Long id, Deuda datos);

    void eliminar(Long id);

    List<PagoDeuda> listarPagos(Long deudaId);

    PagoDeuda registrarPago(Long deudaId, PagoDeuda pago);

    void eliminarPago(Long pagoId);
}
