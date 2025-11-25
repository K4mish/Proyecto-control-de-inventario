import { obtenerCategoria,crearCategoria,obtenerCategoriaPorId,actualizarCategoria,eliminarCategoria } from "../models/categoriaModel";

// Crear una categoria
export const crear = async (req, res) => {
    try {
        const {nombre, descripcion} = req.body;

        if (!nombre) return res.status(400).json({mensaje:'El nombre es obligatorio'});

        const result = await crearCategoria(nombre, descripcion);
        res.status(201).json({mensaje:'Categoria creada', id: result.insertId});
    } catch (error){
        res.status(500).json({mensaje:'Error al crear categoria', error});
    }
};
// Listar categorias
export const listar = async (req, res) => {
  try {
    const categorias = await obtenerCategoria();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener categorías", error });
  }
};
// Obtener categoria por id
export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await obtenerCategoriaPorId(id);

    if (!categoria)
      return res.status(404).json({ mensaje: "Categoría no encontrada" });

    res.json(categoria);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener categoría", error });
  }
};
// Actualizar categoria
export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const result = await actualizarCategoria(id, nombre, descripcion);

    if (result.affectedRows === 0)
      return res.status(404).json({ mensaje: "Categoría no encontrada" });

    res.json({ mensaje: "Categoría actualizada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar categoría", error });
  }
};
// Eliminar categoria
export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await eliminarCategoria(id);

    if (result.affectedRows === 0)
      return res.status(404).json({ mensaje: "Categoría no encontrada" });

    res.json({ mensaje: "Categoría eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar categoría", error });
  }
};