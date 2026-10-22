package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.GastoRecurrente;

@Repository
public interface GastoRecurrenteRepository
        extends JpaRepository<GastoRecurrente, Long> {
}

