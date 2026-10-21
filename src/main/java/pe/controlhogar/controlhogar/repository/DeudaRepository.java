package pe.controlhogar.controlhogar.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.Deuda;

public interface DeudaRepository
        extends JpaRepository<Deuda, Long> {

    Page<Deuda> findByUsuarioId(Long usuarioId, Pageable pageable);
}
