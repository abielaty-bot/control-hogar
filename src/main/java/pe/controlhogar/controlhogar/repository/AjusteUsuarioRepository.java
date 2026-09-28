package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.controlhogar.controlhogar.entity.AjusteUsuario;

public interface AjusteUsuarioRepository
        extends JpaRepository<AjusteUsuario, Long> {
}

