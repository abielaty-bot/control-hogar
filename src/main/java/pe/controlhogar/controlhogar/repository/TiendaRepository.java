package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.Tienda;

public interface TiendaRepository
        extends JpaRepository<Tienda, Long> {
}

