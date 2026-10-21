package pe.controlhogar.controlhogar.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import pe.controlhogar.controlhogar.entity.Usuario;

public interface UsuarioService {

    Page<Usuario> listar(Pageable pageable);

    List<Usuario> buscarPorNombres(String texto);

    Usuario buscarPorId(Long id);

    Usuario guardar(Usuario usuario);

    Usuario actualizar(Long id, Usuario datos);

    void eliminar(Long id);
}