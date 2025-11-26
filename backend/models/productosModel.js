import { pool } from "../config/db.js";

// Crear un producto
export const createProduct = async (nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id) => {
    const [result] = await pool.query(
        `INSERT INTO productos (nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id]
    );
    return result.insertId;
};
// Buscar producto
export const findProductById = async (id) => {
    const [rows] = await pool.query(
        `SELECT idProducto, nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id FROM productos WHERE idProducto = ?`, [id]
    );
    return rows[0];
};
// Listar productos
export const getAllProduct = async () => {
    const [rows] = await pool.query(
        `SELECT idProducto, nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id FROM productos`
    );
    return rows;
};
// Eliminar
export const deleteProduct = async (id) => {
    await pool.query(`DELETE FROM productos WHERE idProducto = ?`, [id]);
};
// Actualizar
export const updateProduct = async (id, nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id) => {
    await pool.query(
        `UPDATE productos SET nombre = ?, descripcion = ?, precioCompra = ?, precioVenta = ?, stock = ?, urlImagen = ?, proveedor_id = ?, categoria_id = ? WHERE idProducto = ?`,
        [nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id, id]
    );
};