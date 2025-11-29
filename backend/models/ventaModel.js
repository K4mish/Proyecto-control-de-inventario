import { pool } from '../config/db.js';

// Crear una venta vacia
export const crearVenta = async (subtotal, metodoPago, usuarioID) => {
  const [result] = await pool.query(`INSERT INTO ventas (subtotal, metodoPago, usuarios_id) VALUES (?, ?, ?)`, [subtotal, metodoPago, usuarioID]);
  return result.insertId;
};
// Actualizar subtotal al agregar productos
export const actualizarSubtotal = async (idVenta, subtotal) => {
  await pool.query(`UPDATE ventas SET subtotal = ? WHERE idVenta = ?`, [subtotal, idVenta]);
};
// Obtener ventas
export const obtenerVentas = async () => {
  const [rows] = await pool.query(`
    SELECT 
        v.idVenta, 
        v.fecha, 
        v.subtotal, 
        v.iva, 
        v.total, 
        v.estado, 
        v.metodoPago, 
        u.nombre AS nombreUsuario, 
        u.apellido AS apellidoUsuario,
        (SELECT COALESCE(SUM(cantidad), 0) FROM detalleVentas WHERE ventas_id = v.idVenta) AS cantidadProductos
    FROM ventas v 
    JOIN usuarios u ON u.idUsuario = v.usuarios_id 
    ORDER BY v.fecha DESC
  `);
  return rows;
};
// Obteber una venta por id
export const obtenerVentaPorID = async (id) => {
  // AHORA HACEMOS UN JOIN CON LA TABLA USUARIOS
  const [rows] = await pool.query(`
    SELECT 
      v.*, 
      u.nombre AS nombreUsuario, 
      u.apellido AS apellidoUsuario 
    FROM ventas v 
    JOIN usuarios u ON u.idUsuario = v.usuarios_id 
    WHERE v.idVenta = ?
  `, [id]);
  
  return rows[0];
};