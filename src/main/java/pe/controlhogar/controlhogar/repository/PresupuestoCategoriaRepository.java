package pe.controlhogar.controlhogar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.PresupuestoCategoria;

public interface PresupuestoCategoriaRepository
        extends JpaRepository<PresupuestoCategoria, Long> {

    List<PresupuestoCategoria> findByPresupuestoMensualId(
            Long presupuestoMensualId);

    boolean existsByPresupuestoMensualIdAndCategoriaId(
            Long presupuestoMensualId,
            Long categoriaId);
}
