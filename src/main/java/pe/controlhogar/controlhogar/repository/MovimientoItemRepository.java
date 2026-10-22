package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.MovimientoItem;

@Repository
public interface MovimientoItemRepository
        extends JpaRepository<MovimientoItem, Long> {
}

