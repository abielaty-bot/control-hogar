package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.Cuenta;

public interface CuentaRepository
        extends JpaRepository<Cuenta, Long> {
}

