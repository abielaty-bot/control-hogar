package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.MisionPersonalizada;

@Repository
public interface MisionPersonalizadaRepository
        extends JpaRepository<MisionPersonalizada, Long> {
}

