import { pool } from "../config/db.js"

// Obtener todas las categorias
export const obtenerCategoria = async () => {
    const [rows] = await pool.query(`SELECT * FROM categorias`);
    return rows;
};
// Crear una categoria
export const crearCategoria = async (nombre, descripcion) => {
    const [result] = await pool.query(
        `INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)`, [nombre, descripcion]
    );
    return {idCategoria: result.insertId, nombre, descripcion};
};
// Obtener categoria por id
export const obtenerCategoriaPorId = async (idCategoria) => {
    const [rows] = await pool.query(`SELECT * FROM categorias WHERE  idCategoria = ?`, [idCategoria]);
    return rows[0];
};
// Actualizar una categoria
export const actualizarCategoria = async (idCategoria,{nombre, descripcion}) => {
    const [result] = await pool.query(`UPDATE categorias SET nombre = ?, descripcion = ? WHERE idCategoria = ?`, [nombre, descripcion, idCategoria]);
    return result;
};
// Eliminar una categoria
export const eliminarCategoria = async (idCategoria) => {
    const [result] = await pool.query(`DELETE FROM categorias WHERE idCategoria = ?`, [idCategoria]);
    return result;
};