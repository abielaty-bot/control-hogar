package pe.controlhogar.controlhogar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.Categoria;

@Repository
public interface CategoriaRepository
        extends JpaRepository<Categoria, Long> {

    List<Categoria> findByUsuarioIdAndActivoTrueOrderByNombreAsc(
            Long usuarioId);

    // Listado paginado de categorias activas de un usuario (Tema 5)
    Page<Categoria> findByUsuarioIdAndActivoTrue(
            Long usuarioId,
            Pageable pageable);

    Optional<Categoria> findByIdAndActivoTrue(Long id);

    boolean existsByUsuarioIdAndNombreIgnoreCase(
            Long usuarioId,
            String nombre);

    boolean existsByUsuarioIdAndNombreIgnoreCaseAndIdNot(
            Long usuarioId,
            String nombre,
            Long id);
}
