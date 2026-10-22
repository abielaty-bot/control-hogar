package pe.controlhogar.controlhogar.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.PresupuestoMensual;

@Repository
public interface PresupuestoMensualRepository
        extends JpaRepository<PresupuestoMensual, Long> {

    Page<PresupuestoMensual> findByUsuarioIdAndActivoTrue(
            Long usuarioId,
            Pageable pageable);

    Optional<PresupuestoMensual> findByIdAndActivoTrue(Long id);

    boolean existsByUsuarioIdAndAnioAndMes(
            Long usuarioId,
            Integer anio,
            Integer mes);

    boolean existsByUsuarioIdAndAnioAndMesAndIdNot(
            Long usuarioId,
            Integer anio,
            Integer mes,
            Long id);
}
