package pe.controlhogar.controlhogar.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import pe.controlhogar.controlhogar.entity.Categoria;
import pe.controlhogar.controlhogar.repository.CategoriaRepository;
import pe.controlhogar.controlhogar.service.CategoriaService;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository repository;

    public CategoriaServiceImpl(CategoriaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Categoria> listar() {
        return repository.findByActivoTrueOrderByNombreAsc();
    }

    @Override
    public Categoria guardar(Categoria categoria) {
        return repository.save(categoria);
    }

    @Override
    public Categoria buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Categoría no encontrada con ID: " + id
                ));
    }

    @Override
    public Categoria actualizar(Long id, Categoria datos) {
        Categoria categoriaExistente = buscarPorId(id);

        categoriaExistente.setNombre(datos.getNombre());
        categoriaExistente.setDescripcion(datos.getDescripcion());

        if (datos.getActivo() != null) {
            categoriaExistente.setActivo(datos.getActivo());
        }

        return repository.save(categoriaExistente);
    }

    @Override
    public void eliminar(Long id) {
        Categoria categoria = buscarPorId(id);
        categoria.setActivo(false);
        repository.save(categoria);
    }
}