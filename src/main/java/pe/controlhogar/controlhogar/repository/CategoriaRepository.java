package pe.controlhogar.controlhogar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.Categoria;

public interface CategoriaRepository
        extends JpaRepository<Categoria, Long> {

    List<Categoria> findByUsuarioIdAndActivoTrueOrderByNombreAsc(
            Long usuarioId);

    Optional<Categoria> findByIdAndActivoTrue(Long id);

    boolean existsByUsuarioIdAndNombreIgnoreCase(
            Long usuarioId,
            String nombre);

    boolean existsByUsuarioIdAndNombreIgnoreCaseAndIdNot(
            Long usuarioId,
            String nombre,
            Long id);
}
