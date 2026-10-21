package pe.controlhogar.controlhogar.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.controlhogar.controlhogar.dto.TotalPorCategoriaDTO;
import pe.controlhogar.controlhogar.entity.Movimiento;

public interface MovimientoRepository
        extends JpaRepository<Movimiento, Long> {

    /**
     * Consulta JPQL con parametros nombrados: movimientos vigentes de un
     * usuario dentro de un rango de fechas, del mas reciente al mas antiguo.
     */
    @Query("""
            SELECT m FROM Movimiento m
            WHERE m.usuario.id = :usuarioId
              AND m.eliminadoEn IS NULL
              AND m.fecha BETWEEN :desde AND :hasta
            ORDER BY m.fecha DESC
            """)
    List<Movimiento> buscarPorUsuarioYFechas(
            @Param("usuarioId") Long usuarioId,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta);

    /**
     * Consulta JPQL de agregacion: suma de montos y cantidad de movimientos
     * agrupados por categoria, devueltos como DTO con SELECT new.
     */
    @Query("""
            SELECT new pe.controlhogar.controlhogar.dto.TotalPorCategoriaDTO(
                COALESCE(c.nombre, 'Sin categoria'),
                SUM(m.montoTotal),
                COUNT(m))
            FROM Movimiento m
            LEFT JOIN m.categoria c
            WHERE m.usuario.id = :usuarioId
              AND m.tipo = :tipo
              AND m.eliminadoEn IS NULL
            GROUP BY c.nombre
            ORDER BY SUM(m.montoTotal) DESC
            """)
    List<TotalPorCategoriaDTO> totalPorCategoria(
            @Param("usuarioId") Long usuarioId,
            @Param("tipo") String tipo);

    /**
     * Consulta JPQL de agregacion simple: total de un tipo de movimiento
     * (INGRESO o GASTO) de un usuario. Devuelve 0 si no hay movimientos.
     */
    @Query("""
            SELECT COALESCE(SUM(m.montoTotal), 0)
            FROM Movimiento m
            WHERE m.usuario.id = :usuarioId
              AND m.tipo = :tipo
              AND m.eliminadoEn IS NULL
            """)
    BigDecimal sumarPorUsuarioYTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("tipo") String tipo);

    // CRUD de movimientos: solo los vigentes (eliminadoEn es nulo)
    Page<Movimiento> findByUsuarioIdAndEliminadoEnIsNull(
            Long usuarioId,
            Pageable pageable);

    Optional<Movimiento> findByIdAndEliminadoEnIsNull(Long id);
}
