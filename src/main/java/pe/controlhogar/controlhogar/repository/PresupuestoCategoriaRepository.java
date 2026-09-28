package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.PresupuestoCategoria;

public interface PresupuestoCategoriaRepository
        extends JpaRepository<PresupuestoCategoria, Long> {
}

