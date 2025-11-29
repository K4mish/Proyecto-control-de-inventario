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
// Obtener stock actual
export const obtenerStock = async (idProducto) => {
    const [rows] = await pool.query(`SELECT stock FROM productos WHERE idProducto = ?`, [idProducto]);
    return rows.length > 0 ? rows[0].stock : null;
};
// Descontar stock
export const descontarStock = async (idProducto, cantidad) => {
    const stockActual = await obtenerStock(idProducto);

    if (stockActual === null){
        throw new Error('Producto no encontrado');
    }

    if (stockActual < cantidad){
        throw new Error(`Stock insuficiente para el producto ID ${idProducto}`);
    }
    
    await pool.query(`UPDATE productos SET stock = stock - ? WHERE idProducto = ?`, [cantidad, idProducto]);
};