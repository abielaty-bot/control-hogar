package pe.controlhogar.controlhogar.service;

import java.util.List;

import pe.controlhogar.controlhogar.entity.Categoria;

public interface CategoriaService {

    List<Categoria> listar();

    Categoria guardar(Categoria categoria);

    Categoria buscarPorId(Long id);

    Categoria actualizar(Long id, Categoria datos);

    void eliminar(Long id);
}
