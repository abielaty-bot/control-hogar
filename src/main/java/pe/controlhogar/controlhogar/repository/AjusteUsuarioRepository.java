package pe.controlhogar.controlhogar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.controlhogar.controlhogar.entity.AjusteUsuario;

@Repository
public interface AjusteUsuarioRepository
        extends JpaRepository<AjusteUsuario, Long> {
}

