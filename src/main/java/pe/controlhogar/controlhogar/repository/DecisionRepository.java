package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.Decision;

public interface DecisionRepository
        extends JpaRepository<Decision, Long> {
}

