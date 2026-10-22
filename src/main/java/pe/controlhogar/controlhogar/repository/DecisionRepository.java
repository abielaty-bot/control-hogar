package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.Decision;

@Repository
public interface DecisionRepository
        extends JpaRepository<Decision, Long> {
}

