package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.ProgresoUsuario;

public interface ProgresoUsuarioRepository
        extends JpaRepository<ProgresoUsuario, Long> {
}

