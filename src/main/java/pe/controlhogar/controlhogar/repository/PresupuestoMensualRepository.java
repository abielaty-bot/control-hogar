package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.PresupuestoMensual;

public interface PresupuestoMensualRepository
        extends JpaRepository<PresupuestoMensual, Long> {
}

