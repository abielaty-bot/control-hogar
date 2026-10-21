package pe.controlhogar.controlhogar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.controlhogar.controlhogar.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    List<Usuario> findByActivoTrueOrderByNombresAsc();

    // Listado paginado de usuarios activos (Tema 5: paginacion y ordenamiento)
    Page<Usuario> findByActivoTrue(Pageable pageable);

    // Consulta JPQL con parametro: busca usuarios activos por su nombre
    @Query("""
            SELECT u FROM Usuario u
            WHERE u.activo = true
              AND LOWER(u.nombres) LIKE LOWER(CONCAT('%', :texto, '%'))
            ORDER BY u.nombres ASC
            """)
    List<Usuario> buscarPorNombres(@Param("texto") String texto);

    Optional<Usuario> findByIdAndActivoTrue(Long id);

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    boolean existsByCorreoIgnoreCase(String correo);

    boolean existsByCorreoIgnoreCaseAndIdNot(String correo, Long id);
}
