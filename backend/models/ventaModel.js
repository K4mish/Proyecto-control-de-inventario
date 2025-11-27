import { pool } from "../config/db.js";

// ---------------------
// Crear una venta con detalles
// ---------------------
export const createVenta = async (ventaData, detalles) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1️⃣ Insertar en tabla ventas
    const { cantidad, precioUnitario, total, estado, metodoPago, usuarios_id } = ventaData;
    const [ventaResult] = await connection.query(
      `INSERT INTO ventas (cantidad, precioUnitario, total, estado, metodoPago, usuarios_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [cantidad, precioUnitario, total, estado, metodoPago, usuarios_id]
    );
    const idVenta = ventaResult.insertId;

    // 2️⃣ Insertar detalles
    for (const detalle of detalles) {
      const { fechaVenta, productos_id } = detalle;
      await connection.query(
        `INSERT INTO detalleVentas (fechaVenta, ventas_id, productos_id) VALUES (?, ?, ?)`,
        [fechaVenta, idVenta, productos_id]
      );
    }

    await connection.commit();
    return idVenta;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ---------------------
// Obtener todas las ventas con detalles
// ---------------------
export const getAllVentas = async () => {
  const [rows] = await pool.query(
    `SELECT v.idVenta, v.cantidad, v.precioUnitario, v.subtotal, v.total, v.estado, v.metodoPago, v.usuarios_id,
            dv.idDetalleVenta, dv.fechaVenta, dv.productos_id
     FROM ventas v
     LEFT JOIN detalleVentas dv ON v.idVenta = dv.ventas_id`
  );
  return rows;
};

// ---------------------
// Obtener una venta por ID con detalles
// ---------------------
export const findVentaById = async (id) => {
  const [rows] = await pool.query(
    `SELECT v.idVenta, v.cantidad, v.precioUnitario, v.subtotal, v.total, v.estado, v.metodoPago, v.usuarios_id,
            dv.idDetalleVenta, dv.fechaVenta, dv.productos_id
     FROM ventas v
     LEFT JOIN detalleVentas dv ON v.idVenta = dv.ventas_id
     WHERE v.idVenta = ?`,
    [id]
  );
  return rows;
};

// ---------------------
// Actualizar venta (solo campos de ventas, detalles se actualizarían por separado)
// ---------------------
export const updateVenta = async (id, ventaData) => {
  const { cantidad, precioUnitario, total, estado, metodoPago, usuarios_id } = ventaData;
  await pool.query(
    `UPDATE ventas SET cantidad = ?, precioUnitario = ?, total = ?, estado = ?, metodoPago = ?, usuarios_id = ? WHERE idVenta = ?`,
    [cantidad, precioUnitario, total, estado, metodoPago, usuarios_id, id]
  );
};

// ---------------------
// Eliminar venta y sus detalles
// ---------------------
export const deleteVenta = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`DELETE FROM detalleVentas WHERE ventas_id = ?`, [id]);
    await connection.query(`DELETE FROM ventas WHERE idVenta = ?`, [id]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};