package pe.controlhogar.controlhogar.service;

import java.util.List;

import pe.controlhogar.controlhogar.entity.Usuario;

public interface UsuarioService {

    List<Usuario> listar();

    Usuario buscarPorId(Long id);

    Usuario guardar(Usuario usuario);

    Usuario actualizar(Long id, Usuario datos);

    void eliminar(Long id);
}