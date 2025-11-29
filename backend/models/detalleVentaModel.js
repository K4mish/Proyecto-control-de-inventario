import { pool } from '../config/db.js';
import { descontarStock } from './productosModel.js';

// Obtener precio unitario
export const obtenerPrecioProducto = async (idProducto) => {
    const [rows] = await pool.query(`SELECT precioVenta, stock FROM productos WHERE idProducto = ?`, [idProducto]);
    return rows.length > 0 ? rows[0] : null;
};
// Insertar detalle de venta
export const crearDetalleVenta =async (idVenta, idProducto, cantidad) => {
    const producto = await obtenerPrecioProducto(idProducto);
    if (!producto){
        throw new Error('Producto no encontrado');
    }

    const {precioVenta, stock} = producto;
    if (stock < cantidad){
        throw new Error('Stock insuficiente');
    }
    
    const [result] = await pool.query(`INSERT INTO detalleVentas (ventas_id, productos_id, cantidad, precioUnitario) VALUES (?, ?, ?, ?)`, [idVenta, idProducto, cantidad, precioVenta]);
    await descontarStock (idProducto, cantidad);
    return result.insertId;
};
// Obtener detalles por venta
export const obtenerDetallesPorVenta = async (idVenta) => {
    const [rows] = await pool.query(`
        SELECT 
            dv.idDetalleVenta,
            dv.ventas_id,
            dv.cantidad,
            dv.precioUnitario,
            dv.productos_id AS idProducto,  
            p.nombre 
        FROM detalleVentas dv 
        JOIN productos p ON p.idProducto = dv.productos_id 
        WHERE dv.ventas_id = ?
    `, [idVenta]);
    return rows;
};