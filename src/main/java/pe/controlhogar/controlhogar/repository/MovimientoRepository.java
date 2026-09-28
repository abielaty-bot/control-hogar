package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.Movimiento;

public interface MovimientoRepository
        extends JpaRepository<Movimiento, Long> {
}

