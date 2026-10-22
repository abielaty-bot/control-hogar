package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.Objetivo;

@Repository
public interface ObjetivoRepository
        extends JpaRepository<Objetivo, Long> {
}

