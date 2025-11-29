import { pool } from '../config/db.js';
import { devolverStock } from './productosModel.js'; 

// Obtener precio de compra actual del producto
export const obtenerDatosProducto = async (idProducto) => {
    const [rows] = await pool.query(`SELECT precioCompra, stock FROM productos WHERE idProducto = ?`, [idProducto]);
    return rows.length > 0 ? rows[0] : null;
};
// Insertar detalle de compra
export const crearDetalleCompra = async (idCompra, idProducto, cantidad, precioUnitarioInput) => {
    // Si no envían precio, usamos el de la BD, si envían, usamos ese (útil si el proveedor cambió el precio)
    let precioFinal = precioUnitarioInput;
    
    if (!precioFinal){
        const producto = await obtenerDatosProducto(idProducto);
        if (!producto) throw new Error('Producto no encontrado');
        precioFinal = producto.precioCompra;
    }

    const [result] = await pool.query(
        `INSERT INTO detalleCompras (compras_id, productos_id, cantidad, precioUnitario) VALUES (?, ?, ?, ?)`, 
        [idCompra, idProducto, cantidad, precioFinal]
    );
    await devolverStock(idProducto, cantidad);
    return result.insertId;
};
// Obtener detalles por compra
export const obtenerDetallesPorCompra = async (idCompra) => {
    const [rows] = await pool.query(`
        SELECT 
            dc.idDetalleCompra,
            dc.compras_id,
            dc.cantidad,
            dc.precioUnitario,
            dc.productos_id AS idProducto,  
            p.nombre 
        FROM detalleCompras dc 
        JOIN productos p ON p.idProducto = dc.productos_id 
        WHERE dc.compras_id = ?
    `, [idCompra]);
    return rows;
};