package pe.controlhogar.controlhogar.service;

import java.util.List;

import pe.controlhogar.controlhogar.entity.Categoria;

public interface CategoriaService {

    List<Categoria> listarPorUsuario(Long usuarioId);

    Categoria buscarPorId(Long id);

    Categoria guardar(Categoria categoria);

    Categoria actualizar(Long id, Categoria datos);

    void eliminar(Long id);
}