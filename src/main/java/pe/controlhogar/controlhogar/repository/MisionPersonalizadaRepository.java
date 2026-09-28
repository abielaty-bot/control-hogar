package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.MisionPersonalizada;

public interface MisionPersonalizadaRepository
        extends JpaRepository<MisionPersonalizada, Long> {
}

