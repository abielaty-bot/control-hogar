package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.MedioPago;

@Repository
public interface MedioPagoRepository
        extends JpaRepository<MedioPago, Long> {
}

