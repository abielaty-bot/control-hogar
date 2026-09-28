package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.MedioPago;

public interface MedioPagoRepository
        extends JpaRepository<MedioPago, Long> {
}

