package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.ProgresoUsuario;

@Repository
public interface ProgresoUsuarioRepository
        extends JpaRepository<ProgresoUsuario, Long> {
}

