package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.Objetivo;

public interface ObjetivoRepository
        extends JpaRepository<Objetivo, Long> {
}

