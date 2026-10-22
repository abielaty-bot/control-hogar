package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.Tienda;

@Repository
public interface TiendaRepository
        extends JpaRepository<Tienda, Long> {
}

