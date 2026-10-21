package pe.controlhogar.controlhogar.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import pe.controlhogar.controlhogar.entity.Categoria;

public interface CategoriaService {

    Page<Categoria> listarPorUsuario(Long usuarioId, Pageable pageable);

    Categoria buscarPorId(Long id);

    Categoria guardar(Categoria categoria);

    Categoria actualizar(Long id, Categoria datos);

    void eliminar(Long id);
}