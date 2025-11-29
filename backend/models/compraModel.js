import { pool } from '../config/db.js';

// Crear una compra
export const crearCompra = async (subtotal, metodoPago, empleadoID, proveedorID) => {
  const [result] = await pool.query(
    `INSERT INTO compras (subtotal, metodoPago, empleados_id, proveedores_id) VALUES (?, ?, ?, ?)`, 
    [subtotal, metodoPago, empleadoID, proveedorID]
  );
  return result.insertId;
};
// Obtener todas las compras
export const obtenerCompras = async () => {
  const [rows] = await pool.query(`
    SELECT 
        c.idCompra, 
        c.fecha, 
        c.subtotal, 
        c.iva, 
        c.total, 
        c.estado, 
        c.metodoPago, 
        u.nombre AS nombreEmpleado, 
        u.apellido AS apellidoEmpleado,
        prov.nombre AS nombreProveedor,
        (SELECT COALESCE(SUM(cantidad), 0) FROM detalleCompras WHERE compras_id = c.idCompra) AS cantidadProductos
    FROM compras c 
    JOIN usuarios u ON u.idUsuario = c.empleados_id 
    JOIN proveedores prov ON prov.idProveedor = c.proveedores_id
    ORDER BY c.fecha DESC
  `);
  return rows;
};
// Obtener una compra por ID
export const obtenerCompraPorID = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      c.*, 
      u.nombre AS nombreEmpleado, 
      u.apellido AS apellidoEmpleado,
      prov.nombre AS nombreProveedor
    FROM compras c 
    JOIN usuarios u ON u.idUsuario = c.empleados_id 
    JOIN proveedores prov ON prov.idProveedor = c.proveedores_id
    WHERE c.idCompra = ?
  `, [id]);
  
  return rows[0];
};
// Actualizar el estado de la compra
export const actualizarEstadoCompra = async (idCompra, nuevoEstado) => {
  const [result] = await pool.query(
    `UPDATE compras SET estado = ? WHERE idCompra = ?`, 
    [nuevoEstado, idCompra]
  );
  return result;
};