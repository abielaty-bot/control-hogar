package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.MovimientoItem;

public interface MovimientoItemRepository
        extends JpaRepository<MovimientoItem, Long> {
}

