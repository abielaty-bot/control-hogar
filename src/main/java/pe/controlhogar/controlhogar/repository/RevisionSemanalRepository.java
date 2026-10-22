package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.RevisionSemanal;

@Repository
public interface RevisionSemanalRepository
        extends JpaRepository<RevisionSemanal, Long> {
}

