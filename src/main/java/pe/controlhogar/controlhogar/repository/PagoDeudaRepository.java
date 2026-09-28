package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.PagoDeuda;

public interface PagoDeudaRepository
        extends JpaRepository<PagoDeuda, Long> {
}

