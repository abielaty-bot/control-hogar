package pe.controlhogar.controlhogar.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.Cuenta;

@Repository
public interface CuentaRepository
        extends JpaRepository<Cuenta, Long> {

    Page<Cuenta> findByUsuarioIdAndActivoTrue(
            Long usuarioId,
            Pageable pageable);

    Optional<Cuenta> findByIdAndActivoTrue(Long id);

    boolean existsByUsuarioIdAndNombreIgnoreCase(
            Long usuarioId,
            String nombre);

    boolean existsByUsuarioIdAndNombreIgnoreCaseAndIdNot(
            Long usuarioId,
            String nombre,
            Long id);
}
