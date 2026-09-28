package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.RevisionSemanal;

public interface RevisionSemanalRepository
        extends JpaRepository<RevisionSemanal, Long> {
}

