package pe.controlhogar.controlhogar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.PagoDeuda;

@Repository
public interface PagoDeudaRepository
        extends JpaRepository<PagoDeuda, Long> {

    List<PagoDeuda> findByDeudaIdOrderByFechaPagoDesc(Long deudaId);

    boolean existsByDeudaId(Long deudaId);
}
