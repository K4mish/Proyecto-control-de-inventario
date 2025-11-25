import { pool } from "../config/db.js";

// Crear un producto
export const createProduct = async (nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedores_idProveedor, categorias_idCategoria) => {
    const [result] = await pool.query(
        `INSERT INTO productos (nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedores_idProveedor, categorias_idCategoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedores_idProveedor, categorias_idCategoria]
    );
    return result.insertId;
};
// Buscar producto
export const findProductById = async (id) => {
    const [rows] = await pool.query(
        `SELECT idProducto, nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, categorias_idCategoria FROM productos WHERE idProducto = ?`, [id]
    );
    return rows[0];
};
// Listar productos
export const getAllProduct = async () => {
    const [rows] = await pool.query(
        `SELECT idProducto, nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, categorias_idCategoria FROM productos`
    );
    return rows;
};
// Eliminar
export const deleteProduct = async (id) => {
    await pool.query(`DELETE FROM productos WHERE idProducto = ?`, [id]);
};
// Actualizar
export const updateProduct = async (id, nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedores_idProveedor, categorias_idCategoria) => {
    await pool.query(
        `UPDATE productos SET nombre = ?, descripcion = ?, precioCompra = ?, precioVenta = ?, stock = ?, urlImagen = ?, proveedores_idProveedor = ?, categorias_idCategoria = ? WHERE idProducto = ?`,
        [nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedores_idProveedor, categorias_idCategoria, id]
    );
};